const CONSTANTS = {
    EXCEL_ERRORS: ['#DIV/0!', '#N/A', '#NAME?', '#NULL!', '#NUM!', '#REF!', '#VALUE!', '#SPILL!', '#CALC!'],
    KEYS: {
        GRP: 'grp',
        DEF: 'def',
        DEFAULT: 'default',
        CAT: 'cat',
        COMING: 'coming',
    },
    STORAGE: {
        CHK_GRP: 'groupChk',
        VAL_DEFAULT: 'oDefaultValue',
        VAL_GRP: 'groupValue',
        VAL_DEF: 'defaultValue',
    }
}

class ExcelToJson {
    constructor() {
        this.dom = {
            area1: document.querySelector('#area1'),
            area2: document.querySelector('#area2'),
            
            message_wrap: document.querySelector('.message_wrap'),
            error_wrap: document.querySelector('.error_wrap'),
            copy_wrap: document.querySelector('.copy_wrap'),
            
            clipboard: document.querySelector('.clipboard'),
            btnConvert: document.querySelector('.btnConvert'),
            table_container: document.querySelector('.table_container'),
            optChkContainer: document.querySelector('.optChk_container') || document.querySelector('.chkbox:nth-child(3)'), // 위치 찾기용

            leftBtns: document.querySelectorAll('.left_btn'),
            tabItems: document.querySelectorAll('.tab_item'),

            opt_rad: document.querySelector('#opt_rad'),
            grp_rad: document.querySelector('#grp_rad'),
            defaultInput: document.querySelector('#default'),
            grp: document.querySelector('#grp'),
            def: document.querySelector('#def'),
            gdInputs: document.querySelectorAll('.gdInput'),
            
            dimm_wrap: document.querySelector('.dimm_wrap'),
            dimm_spinner: document.querySelector('.dimm_spinner'),
        };

        this.init();
    }

    init() {
        this.loadSettings();
        this.bindEvents();
    }

    // --- 1. 설정 로드 ---
    loadSettings() {
        const { grp_rad, opt_rad, defaultInput, grp, def } = this.dom;

        // 라디오 버튼
        localStorage.getItem(CONSTANTS.STORAGE.CHK_GRP) === 'true' ? grp_rad.checked = true : opt_rad.checked = true;

        // 인풋 값
        defaultInput.value = localStorage.getItem(CONSTANTS.STORAGE.VAL_DEFAULT) || CONSTANTS.KEYS.DEFAULT;
        grp.value = localStorage.getItem(CONSTANTS.STORAGE.VAL_GRP) || CONSTANTS.KEYS.GRP;
        def.value = localStorage.getItem(CONSTANTS.STORAGE.VAL_DEF) || CONSTANTS.KEYS.DEF;
    }

    // --- 2. 이벤트 바인딩 ---
    bindEvents() {
        const { 
            leftBtns, grp_rad, opt_rad, gdInputs, 
            table_container, clipboard, btnConvert, 
            defaultInput, grp, def 
        } = this.dom;

        // 탭 전환
        leftBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleTabRotate(e));
        });

        // 설정 저장
        opt_rad.addEventListener('click', () => localStorage.setItem(CONSTANTS.STORAGE.CHK_GRP, false));
        grp_rad.addEventListener('click', () => localStorage.setItem(CONSTANTS.STORAGE.CHK_GRP, true));
        
        gdInputs.forEach(input => {
            input.addEventListener('keyup', () => {
                localStorage.setItem(CONSTANTS.STORAGE.VAL_DEFAULT, defaultInput.value);
                localStorage.setItem(CONSTANTS.STORAGE.VAL_GRP, grp.value);
                localStorage.setItem(CONSTANTS.STORAGE.VAL_DEF, def.value);
            });
        });

        // [중요] 화살표 함수로 this 유지
        btnConvert.addEventListener('click', (e) => this.handleConversion(e));
        clipboard.addEventListener('click', (e) => this.copyText(e));
        table_container.addEventListener('click', (e) => this.handleTableClick(e));
    }

    handleTabRotate(e) {
        const { leftBtns, tabItems } = this.dom;
        const target = e.target;
        if (target.classList.contains('active')) return;
        
        const attr = target.getAttribute('data-id');
        leftBtns.forEach(c => c.classList.remove('active'));
        tabItems.forEach(c => c.classList.remove('active'));
        
        target.classList.add('active');
        if(tabItems[attr]) tabItems[attr].classList.add('active');
    }

    handleTableClick(e) {
        if (e.target.closest('.table_item__head')) {
            const target = e.target.closest('.table_item');
            target.classList.toggle('active');
        }
    }

    // --- 3. 핵심 변환 로직 (사용자 원본 로직 복원) ---
    // --- 3. 핵심 변환 로직 (사용자 지정 로직 유지 + 가독성 정리) ---
    async handleConversion(e) {
        e.preventDefault();
        const { 
            area1, area2, message_wrap, error_wrap, copy_wrap, clipboard, table_container, 
            grp_rad, defaultInput, grp, def, optChkContainer
        } = this.dom;

        // 1. 기본 유효성 검사
        if (!area1.value.includes('\t')) return;
        
        this.toggleLoading(true);

        // 2. UI 초기화
        message_wrap.innerHTML = '';
        error_wrap.innerHTML = '';
        table_container.innerHTML = '';
        copy_wrap.innerHTML = '';
        if(optChkContainer) optChkContainer.innerHTML = '';

        await new Promise(r => setTimeout(r, 100)); // 로딩 대기

        try {
            // [Step 1] 파싱
            let area1Core = area1.value.split('\n');
            let counts = {}; 
            let crrCnt = 0;
            let optArrChecker = {}; // optCd 수집용
            let resultData = [];
            let grpObj = {}; // 그룹별 디폴트 값 수집용
            let hasError = false;
            let isDefault = 0; // 옵션형 디폴트 카운트
            
            
            area1Core = area1Core.map(v => v.replace(/{\"|\":\"|\",\"|\"|\},|\}/g, '').trim());
            area1Core = area1Core.map(v => v.replace(/\t+/g, '\t').split('\t').map(c => c.trim()));
            area1Core.pop();

            // [Step 2] 데이터 구조 검증 (길이 및 공백)
            const maxArrLength = Math.max(...area1Core.map(v => v.length));
            area1Core.forEach(row => counts[row.length] = (counts[row.length] || 0) + 1);

            // 행 길이 불일치 검사 (데이터가 섞였는지 확인)
            if (Object.keys(counts).length > 1) { 
                this.toggleLoading(false); return false; 
            }

            // 공백 및 짝수(Key-Value) 검사
            for (let i = 0; i < area1Core.length; i++) {
                const row = area1Core[i];
                if (row.length % 2 !== 0 || row.length !== maxArrLength) {
                    this.showError(`<span class="red">${i+1}</span>줄 값에 <span class="red">공백</span>이 있거나 열 개수가 맞지 않습니다.`);
                    this.toggleLoading(false); return;
                }
            }

            // [Step 3] 데이터 테이블 생성 및 분석
            // 짝수 인덱스(Key)를 기준으로 열(Column) 순회
            for (let colIdx = 0; colIdx < area1Core[0].length; colIdx += 2) {
                let colKey = '';
                let valCounts = {};
                let uniqueSet = new Set();

                // 행(Row) 순회하며 데이터 수집
                for (let rowIdx = 0; rowIdx < area1Core.length; rowIdx++) {
                    colKey = area1Core[rowIdx][colIdx];
                    let val = area1Core[rowIdx][colIdx + 1];
                    
                    valCounts[val] = (valCounts[val] || 0) + 1;
                    uniqueSet.add(val);
                }

                // optCd 데이터 별도 저장
                if (colKey.indexOf('optCd') !== -1) {
                    optArrChecker[colKey] = [...uniqueSet];
                }

                // 테이블 HTML 생성
                let uniqueArr = [...uniqueSet];
                let tableHtml = `
                    <div class="table_item">
                        <div class="table_item__head">
                            <span class="table_item__htxt">${colKey}</span>
                            <span class="table_item__hsize">(${uniqueSet.size})</span>
                            <div class="table_arrow">▾</div>
                        </div>
                        <ul class="table_item__body">
                            ${uniqueArr.map(val => `
                                <li class="table_item__li">
                                    <span class="table_item__btxt">${val}</span>
                                    <span class="table_item__bsize">(${valCounts[val]})</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
                
                // 줄바꿈 처리 (13개씩)
                if (crrCnt > 0 && crrCnt % 13 === 0) {
                    table_container.insertAdjacentHTML('beforeend', '<br />');
                }
                table_container.insertAdjacentHTML('beforeend', tableHtml);
                crrCnt++;
            }

            // [Step 4] 상단 키값(Header) 표시
            const headerRow = area1Core[0];
            headerRow.forEach((v, i) => {
                if (i % 2 === 0) message_wrap.insertAdjacentHTML('beforeend', `<span class="message_item">${v}</span>`);
            });

            // [Step 5] 실제 변환 및 비즈니스 로직 검사
            for (let idx = 0; idx < area1Core.length; idx++) {
                const row = area1Core[idx];
                let obj = {};
                
                // A. 옵션/그룹 키 유효성 체크
                let grpIdx = row.indexOf(grp.value);
                let defIdx = row.indexOf(def.value);
                let defaultIdx = row.indexOf(defaultInput.value);

                if (grp_rad.checked) { // 그룹형
                    if (grpIdx === -1 || defIdx === -1) {
                        this.showError(`그룹형 바잉툴 : 키 값 <span class="red">${grp.value}</span> 또는 <span class="red">${def.value}</span>를 확인하세요.`);
                        hasError = true; break;
                    }
                    // 그룹핑 데이터 수집
                    let gVal = row[grpIdx + 1];
                    let dVal = row[defIdx + 1];
                    grpObj[gVal] = (grpObj[gVal] || []);
                    grpObj[gVal].push(dVal);

                } else { // 옵션형
                    if (defaultIdx === -1) {
                        this.showError(`옵션형 바잉툴 : 디폴트 키 값 <span class="blue">${defaultInput.value}</span>를 확인하세요.`);
                        hasError = true; break;
                    }
                    if (row[defaultIdx + 1] === 'O') isDefault++;
                }

                // B. 객체 매핑 (Key: Value)
                for (let i = 0; i < row.length; i += 2) {
                    const key = row[i];
                    const val = row[i+1];

                    // 키 불일치 검사 (헤더 기준)
                    if (key !== headerRow[i]) {
                        this.showError(`<span class="red">${idx + 1}</span>줄, 키 불일치: <span class="red">${key}</span> (예상: ${headerRow[i]})`);
                        message_wrap.children[i / 2].classList.add('red');
                        hasError = true; break;
                    }

                    // 엑셀 에러값 검사
                    if (CONSTANTS.EXCEL_ERRORS.some(err => val.includes(err))) {
                        this.showError(`<span class="red">${idx + 1}</span>줄, 엑셀 에러 값 포함: <span class="red">${val}</span>`);
                        hasError = true; break;
                    }

                    obj[key] = val;
                }

                if (hasError) break;
                resultData.push(obj);
            }

            // 에러 발생 시 중단
            if (hasError) { this.toggleLoading(false); return; }

            // [Step 5-1] 옵션형/그룹형 최종 개수 검사
            if (!grp_rad.checked) { // 옵션형
                if (isDefault === 0) {
                    this.showError(`옵션형: 설정 <span class="red">"O"</span>이 없습니다.`);
                    this.toggleLoading(false); return;
                }
                if (isDefault > 1) {
                    this.showError(`옵션형: 설정 <span class="black">"O"</span>이 <span class="red">2개 이상</span>입니다.`);
                    this.toggleLoading(false); return;
                }
            } else { // 그룹형
                if (localStorage.getItem(CONSTANTS.STORAGE.CHK_GRP) === 'true') {
                    for (let [grpName, vals] of Object.entries(grpObj)) {
                        let opCount = vals.filter(v => v === 'O').length;
                        if (opCount === 0) {
                            this.showError(`그룹 "<span class="red">${grpName}</span>"에 "O"가 없습니다.`);
                            this.toggleLoading(false); return;
                        }
                        if (opCount > 1) {
                            this.showError(`그룹 "<span class="red">${grpName}</span>"에 "O"가 2개 이상입니다.`);
                            this.toggleLoading(false); return;
                        }
                    }
                }
            }

            // -----------------------------------------------------------
            // [Step 6] 성공 결과 출력 (사용자 지정 로직 - 수정 금지 구역)
            // -----------------------------------------------------------
            const jsonBody = resultData.map(item => '\t' + JSON.stringify(item)).join(',\n');
            area2.value = `{"result": [\n${jsonBody}\n]}`;
            // -----------------------------------------------------------

            // [Step 7] 성공 처리 및 버튼 생성
            let txtCatGrp = {};
            clipboard.style.display = 'flex';
            error_wrap.insertAdjacentHTML('beforeend', `<div class="error_item success_transfer">상태: <span class="green">변환 성공!</span></div>`);

            // OptChecker 로직
            const parseObjData = resultData;
            const isCatGrp = 
                Object.hasOwn(parseObjData[0], CONSTANTS.KEYS.CAT) && 
                Object.hasOwn(parseObjData[0], CONSTANTS.KEYS.GRP) && 
                Object.hasOwn(parseObjData[0], CONSTANTS.KEYS.COMING);
                
            if (isCatGrp) txtCatGrp = this.objCatGrp(parseObjData);

            if(optChkContainer) {
                const hasOptCd = Object.keys(parseObjData[0]).some(k => k.indexOf('optCd') !== -1);
                
                if (hasOptCd && !grp_rad.checked) {
                    const btnWrapper = document.createElement('div');
                    btnWrapper.className = 'checkerClip';
                    btnWrapper.style.width = '100%';

                    const btn = document.createElement('button');
                    btn.className = 'optCheckerBtn';
                    btn.style.cssText = "cursor: pointer; background-color: #38f49c; border-radius: 10px; margin-left: 10px; padding: 5px 20px; font-weight: 700; border:none;";
                    btn.textContent = 'optCheck JSON 복사';

                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.writeClipboardText(JSON.stringify(optArrChecker));
                        copy_wrap.innerHTML = '';
                        copy_wrap.insertAdjacentHTML('beforeend', `<div class="copy_item">상태: <span class="blue">optCheck JSON 복사 성공!</span></div>`);
                    });

                    btnWrapper.appendChild(btn);
                    optChkContainer.appendChild(btnWrapper);
                }
            }

        } catch (err) {
            console.error(err);
            this.showError('알 수 없는 오류 발생');
        } finally {
            this.toggleLoading(false);
        }
    }

    // --- 4. 유틸리티 메서드 ---
    objCatGrp(data) {
        const result = {};
        const categories = [...new Set(data.map(item => item.cat))];

        categories.forEach(cat => {
            result[cat] = {};

            const catItems = data.filter(item => item.cat === cat);
            const groups = [...new Set(catItems.map(item => item.grp))];

            groups.forEach(grp => {
                const grpItems = catItems.filter(item => item.grp === grp);
                const optMap = {};

                grpItems.forEach(item => {
                    Object.entries(item).forEach(([key, value]) => {
                        if (key.includes('optCd') && value !== '-') {
                            if (!optMap[key]) optMap[key] = new Set();

                            optMap[key].add(value);
                        }
                    });
                });

                result[cat][grp] = {};
                
                for (const [optKey, optValueSet] of Object.entries(optMap)) {
                    result[cat][grp][optKey] = [...optValueSet];
                }
            });
        });

        return result;
    }

    toggleLoading(active) {
        const { dimm_wrap, dimm_spinner } = this.dom;
        if (active) {
            dimm_wrap.classList.add('active');
            dimm_spinner.classList.add('active');
        } else {
            dimm_wrap.classList.remove('active');
            dimm_spinner.classList.remove('active');
        }
    }

    showError(msg) {
        this.dom.error_wrap.insertAdjacentHTML('beforeend', `<div class="error_item error">에러: ${msg}</div>`);
    }

    async copyText(e) {
        e.preventDefault();

        const { area2, copy_wrap, error_wrap } = this.dom;
        const hasError = error_wrap.querySelectorAll('.error').length > 0;

        this.toggleLoading(true);
        area2.select();
        copy_wrap.innerHTML = '';

        if (!hasError && area2.value) {
            try {
                await navigator.clipboard.writeText(area2.value);
                
                copy_wrap.insertAdjacentHTML('beforeend', 
                    `<div class="copy_item">상태: <span class="blue">Excel to Json 복사 성공!</span></div>`
                );
            } catch (err) {
                console.error('복사 실패:', err);
            }
        } else {
            copy_wrap.insertAdjacentHTML('beforeend', 
                `<div class="copy_item">상태: <span class="red">에러를 수정하세요!</span></div>`
            );
        }

        setTimeout(() => this.toggleLoading(false), 200);
    }

    async writeClipboardText(text) {
        this.toggleLoading(true);
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            console.error(error.message);
        }
        this.toggleLoading(false);
    }
}

window.addEventListener('load', () => {
    new ExcelToJson();
});
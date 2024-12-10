window.addEventListener('load', () => {
    const area1 = document.querySelector('#area1');
    const area2 = document.querySelector('#area2');
    const area3 = document.querySelector('#area3');
    const area4 = document.querySelector('#area4');

    const ttttt_wrap = document.querySelector('.ttttt_wrap');
    const error_wrap = document.querySelector('.error_wrap');
    const copy_wrap = document.querySelector('.copy_wrap');
    const clipboard = document.querySelector('.clipboard');
    const table_container = document.querySelector('.table_container');

    const excelError = ['#DIV/0!', '#N/A', '#NAME?', '#NULL!', '#NUM!', '#REF!', '#VALUE!', '#SPILL!', '#CALC!'];
    let parseObjData = {};

    // 로딩
    const loading = () => {
        let dimm_wrap = document.querySelector('.dimm_wrap');
        let dimm_spinner = document.querySelector('.dimm_spinner');

        if (area1.value.length) {
            dimm_wrap.classList.add('active');
            dimm_spinner.classList.add('active');

            let timer = null;
            if (timer != null) clearTimeout(timer);
            timer = setTimeout(() => onActive(), 300);

            const onActive = () => {
                dimm_wrap.classList.remove('active');
                dimm_spinner.classList.remove('active');
            }
        }
    }

    // 복사
    const copyText = (e) => {
        e.preventDefault();
        loading();

        area2.select();
        copy_wrap.innerHTML = '';

        if (document.querySelectorAll('.error').length === 0) {
            navigator.clipboard.writeText(area2.value);

            copy_wrap.insertAdjacentHTML('beforeend', `<div class="copy_item">상태: <span class="blue">Excel to Json 복사 성공!</span></div>`,);
        } else {
            copy_wrap.insertAdjacentHTML('beforeend', `<div class="copy_item">상태: <span class="red">에러를 수정하세요!</span></div>`,);
        }
    }

    // 복사 Func
    const writeClipboardText = async (text) => {
        loading();

        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            console.error(error.message);
        }
    }

    const hhh_g = document.querySelector('#hhh_g');
    const hhh_o = document.querySelector('#hhh_o');
    const defaultInput = document.querySelector('#default');
    const grp = document.querySelector('#grp');
    const def = document.querySelector('#def');
    const gdInputs = document.querySelectorAll('.gdInput');
    const optChkContainer = document.querySelector('.optChk_container');

    localStorage.getItem("groupChk") === null ? hhh_o.click() : '';

    hhh_o.addEventListener('click', () => {
        localStorage.setItem("groupChk", false);
    });
    hhh_g.addEventListener('click', () => {
        localStorage.setItem("groupChk", true);
    });

    localStorage.getItem("groupChk") === 'true' ? hhh_g.checked = true : hhh_o.checked = true;

    defaultInput.value = localStorage.getItem('oDefaultValue') === null || localStorage.getItem('oDefaultValue') === '' ? 'default' : localStorage.getItem('oDefaultValue');
    grp.value = localStorage.getItem('groupValue') === null || localStorage.getItem('groupValue') === '' ? 'grp' : localStorage.getItem('groupValue');
    def.value = localStorage.getItem('defaultValue') === null || localStorage.getItem('defaultValue') === '' ? 'def' : localStorage.getItem('defaultValue');

    gdInputs.forEach(e=>{
        e.addEventListener('keyup', () => {
            localStorage.setItem('oDefaultValue', defaultInput.value);
            localStorage.setItem('groupValue', grp.value);
            localStorage.setItem('defaultValue', def.value);
        });
    });

    document.querySelector('.btb1').addEventListener('click', (e) => {
        e.preventDefault();
        if (!area1.value.includes('\t')) return;
        loading();

        let area1Core = area1.value.split('\n');
        globalObjArr = [];
        let obtj = {}
        let detectNum;
        let maxArrLength;

        area1Core = area1Core.map(v => v.replace(/{\"|\":\"|\",\"|\"|\},|\}/g, '').trim());
        area1Core = area1Core.map(v => commonFunc.transferTabTxt(v).split('\t').map(c => c.trim()));
        area1Core.pop();

        maxArrLength = Math.max(...Object.values(area1Core).map(v => v.length));

        for (let i=0; i<area1Core.length; i++) obtj[area1Core[i].length] = (obtj[area1Core[i].length] || 0) + 1;
        
        ttttt_wrap.innerHTML = '';
        error_wrap.innerHTML = '';
        table_container.innerHTML = '';
        optChkContainer.innerHTML = '';

        // 공백 검사
        for (let i=0; i<area1Core.length; i++) {
            if (area1Core[i].length % 2 !== 0 || area1Core[i].length !== maxArrLength) {
                
                error_wrap.insertAdjacentHTML('beforeend', 
                    `<div class="error_item error">에러: <span class="red">${i+1}</span>줄 값에 <span class="red">공백</span>이 있습니다. <span class="blue">기본 값</span> "<span class="blue">-</span>" 또는 <span class="blue">올바른 값</span>을 넣어주세요.</div>`
                );
                break;
            }
        }

        let crrCnt = 0;
        let optArrChecker = {};
        for (let i=0; i<area1Core[0].length; i+=2) {
            let setKey = '';
            let setObj = {};
            let setUnique = new Set();

            for (let j=0; j<area1Core.length; j++) {
                setKey = area1Core[j][i];
                setObj[area1Core[j][i+1]] = (setObj[area1Core[j][i+1]] || 0) + 1;
                setUnique.add(area1Core[j][i+1]);
            }

            globalObjArr.push([setKey, setUnique.size, [...setUnique], setObj]);

            // 옵션형 바잉툴 Opt
            if (setKey.indexOf('optCd') !== -1) optArrChecker[setKey] = [...setUnique];

            table_container.insertAdjacentHTML('beforeend', 
                `<div class="table_item" data-num="${crrCnt}">
                    <div class="table_item__head">
                        <span class="table_item__htxt">${setKey}</span>
                        <span class="table_item__hsize">(${setUnique.size})</span>
                        <div class="table_arrow">▾</div>
                    </div>
                    <ul class="table_item__body"></ul>
                </div>${crrCnt % 13 === 0 && crrCnt > 1 ? "<br />" : ""}`
            );

            let table_item = document.querySelector(`.table_item[data-num="${crrCnt}"] .table_item__body`);
            for (let itemLi of [...setUnique]) {
                table_item.insertAdjacentHTML('beforeend', 
                    `<li class="table_item__li">
                        <span class="table_item__btxt">${itemLi}</span>
                        <span class="table_item__bsize">(${setObj[itemLi]})</span>
                    </li>`
                );
            }
            crrCnt++;
        }

        detectNum = area1Core[0];
        area1Core[0].forEach((v,i) => {
            if (i % 2 === 0) ttttt_wrap.insertAdjacentHTML('beforeend', `<span class="tttt_item">${v}</span>`);
        });

        if (Object.entries(obtj).length > 1) return false;

        let coreStr = '';
        let grpObj = {}
        let isDefault = 0;
        copy_wrap.innerHTML = '';

        for (let idx=0; idx<area1Core.length; idx++) {
            let grpIdx = area1Core[idx].indexOf(grp.value);
            let defIdx = area1Core[idx].indexOf(def.value);

            if (hhh_g.checked) {
                if (grpIdx === -1 || defIdx === -1) {
                    error_wrap.insertAdjacentHTML('beforeend',
                        `<div class="error_item error">에러: <span class="black">그룹형 바잉툴 : 그룹 키 값 <span class="red">${grp.value !== '' ? grp.value : '(값 X)'}</span></span>과 <span class="black">디폴트 키 값 <span class="red">${def.value !== '' ? def.value : '(값 X)'}</span></span>가 정상인지 확인하세요!</div>`,
                    );
                    break;
                }
            } else {
                let defaultIdx = area1Core[idx].indexOf(defaultInput.value);

                if (defaultIdx === -1) {
                    error_wrap.insertAdjacentHTML('beforeend',
                        `<div class="error_item error">에러: <span class="black">옵션형 바잉툴 : 디폴트 키 값 <span class="blue">${defaultInput.value !== '' ? defaultInput.value : '(값 X)'}</span></span>가 정상인지 확인하세요!</div>`,
                    );
                    break;
                }

                let defaultValue = area1Core[idx][defaultIdx+1];

                if (defaultValue === 'O') isDefault++;

                if (idx === area1Core.length - 1) {
                    if (isDefault === 0) {
                        // O 없음
                        error_wrap.insertAdjacentHTML('beforeend',
                            `<div class="error_item error">에러: <span class="black">옵션형 바잉툴</span>의 <span class="blue">${defaultInput.value}</span> 설정 <span class="red">"O"</span>이 없습니다!</span></div>`,
                        );
                        break;
                    }

                    if (isDefault > 1) {
                        // O 2개 이상
                        error_wrap.insertAdjacentHTML('beforeend',
                            `<div class="error_item error">에러: <span class="black">옵션형 바잉툴</span>의 <span class="blue">${defaultInput.value}</span> 설정 <span class="black">"O"</span>이 <span class="red">2개 이상</span>입니다!</div>`,
                        );
                        break;
                    }
                }
            }

            grpObj[area1Core[idx][grpIdx+1]]=(grpObj[area1Core[idx][grpIdx+1]]||[]);
            grpObj[area1Core[idx][grpIdx+1]].push(area1Core[idx][defIdx+1]);

            if (idx===0) coreStr+='{"result":[\n';

            coreStr += '{';

            for (let i=0; i<area1Core[idx].length; i+=2) {
                i===area1Core[idx].length-2?coreStr += `"${area1Core[idx][i]}":"${area1Core[idx][i+1]}"`:coreStr += `"${area1Core[idx][i]}":"${area1Core[idx][i+1]}",`;

                if (area1Core[idx][i] !== detectNum[i]) {
                    error_wrap.insertAdjacentHTML('beforeend',
                        `<div class="error_item error">에러: <span class="red">${idx+1}</span>번, 정상 키 값: <span class="black">${detectNum[i]}</span>, 비정상 키 값: <span class="red">${area1Core[idx][i]}</span> 발견!</div>`,
                    );
                    ttttt_wrap.children[i/2].classList.add('red');
                    break;
                }
            }

            let tech = area1Core[idx].join(' ');
            for (let j=0; j<excelError.length; j++) {
                if (tech.includes(excelError[j])) {
                    error_wrap.insertAdjacentHTML('beforeend',
                        `<div class="error_item error">에러: <span class="red">${idx+1}</span>번, 엑셀 오류 값: <span class="red">${excelError[j]}</span> 발견!</div>`,
                    );
                    break;
                }
            }

            idx === area1Core.length-1 ? coreStr += '}' : coreStr += '},\n';

            if (idx === area1Core.length-1) {
                v = '';
                coreStr+='\n]}';
            }
        }

        if (!hhh_g.checked && (isDefault === 0 || isDefault > 1)) return false;

        let grpEntries = Object.entries(grpObj);
        if (localStorage.getItem("groupChk") === 'true') {
            for (let l=0; l<grpEntries.length; l++) {
                let grpSet = {}
                grpEntries[l][1].forEach(k=>grpSet[k]=(grpSet[k]||0)+1);
                let [grpName, grpData] = [grpEntries[l][0], Object.entries(grpSet)];
    
                if (grpEntries[l][1].indexOf('O') !== -1) {
                    // O 있음
                    let opCount = grpData.filter(v=>v[0]==='O').map(k=>k[1])[0];
                    
                    if (opCount > 1) {
                        // O 2개 이상
                        error_wrap.insertAdjacentHTML('beforeend',
                            `<div class="error_item error">에러: <span class="black">"${grpName}"</span>의 <span class="blue">"${def.value}"</span> 설정 <span class="black">"O"</span>이 <span class="red">2개 이상</span>입니다!</div>`,
                        );
                        break;
                    }
                } else {
                    // O 없음
                    error_wrap.insertAdjacentHTML('beforeend',
                        `<div class="error_item error">에러: <span class="black">"${grpName}"</span>의 <span class="blue">"${def.value}"</span> 설정 <span class="red">"O"</span>이 없습니다!</span></div>`,
                    );
                    break;
                }
            }
        }

        if (error_wrap.children.length === 0) {
            copy_wrap.innerHTML = '';
            error_wrap.insertAdjacentHTML('beforeend', `<div class="error_item success_transfer">상태: <span class="green">변환 성공!</span></div>`,);
        }

        area1.value.length > 0 ? clipboard.style.display = 'flex' : clipboard.style.display = 'none';
        area2.innerHTML = coreStr;

        parseObjData = JSON.parse(coreStr).result;

        const isCatGrp = Object.hasOwn(parseObjData[0], 'cat') && Object.hasOwn(parseObjData[0], 'grp') && Object.hasOwn(parseObjData[0], 'coming');
        let txtCatGrp = {};
        if (isCatGrp) txtCatGrp = commonFunc.objCatGrp(parseObjData);

        optChkContainer.insertAdjacentHTML('beforeend',`
            <div class="checkerClip" style="width: 100%;">
                ${!isCatGrp ? 
                    !hhh_g.checked ? `<button class="optCheckerBtn">optCheck JSON 복사</button>` : '' 
                    : ``
                    // : `<button class="optCheckerBtn1">공통기획전 JSON 복사</button>`
                }
            </div>
        `);

        if (document.querySelector('.optCheckerBtn') !== null) {
            let optCheckerBtn = document.querySelector('.optCheckerBtn');
            optCheckerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                writeClipboardText(JSON.stringify(optArrChecker));
                
                copy_wrap.innerHTML = '';
                copy_wrap.insertAdjacentHTML('beforeend', `<div class="copy_item">상태: <span class="blue">optCheck JSON 복사 성공!</span></div>`,);
            });
        }
        
        if (document.querySelector('.optCheckerBtn1') !== null) {
            let optCheckerBtn1 = document.querySelector('.optCheckerBtn1');
            optCheckerBtn1.addEventListener('click', (e) => {
                e.preventDefault();
                writeClipboardText(JSON.stringify(txtCatGrp));
            });
        }
    });
        
    let commonFunc = {
        init: function() {
            this.tabRotate();
            this.tableContainer();
        },
        tabRotate: function() {
            const leftBox = document.querySelector('.left_box');
            const leftBtns = leftBox.querySelectorAll('.left_btn');
            const tabItems = document.querySelectorAll('.tab_item');

            leftBtns.forEach(item => {
                item.addEventListener('click', (e) => {
                    let attr = e.target.getAttribute('data-id');

                    if (e.target.classList.contains('active')) return;
                    else {
                        leftBtns.forEach(c=>c.classList.remove('active'));
                        tabItems.forEach(c=>c.classList.remove('active'));
                        e.target.classList.add('active');
                        tabItems[attr].classList.add('active');
                    }
                });
            });
        },
        randomColor: function() {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            const t = Math.floor(Math.random() * (7 - 3 + 1)) + 3;
            return `rgb(${r},${g},${b},0.${t})`;
        },
        strideSiblings: function(ele){
            let parentEle = ele.parentNode;
            let index = Array.prototype.indexOf.call(parentEle.children, ele);
            return index;
            // return parent.children[index + stride];
        },
        transferTabTxt: function( propTxt ) {
            let uniqueTxt = '';
            let uniqueArrTransfer = [];
        
            for (let i=0; i<propTxt.length; i++) {
                if (propTxt[i] === '\t') {
                    uniqueArrTransfer.push(i);
                    if (i === propTxt.length-1 && uniqueArrTransfer.length !== 0) uniqueTxt += '\t';
                } else {
                    if (uniqueArrTransfer.length !== 0) {
                        uniqueTxt += '\t';
                        uniqueArrTransfer=[];
                    }
                    uniqueTxt += propTxt[i];
                }
            }
        
            return uniqueTxt;
        },
        tableContainer: function() {
            let table_container = document.querySelector('.table_container');
            table_container.addEventListener('click', (e) => {
                if (e.target.closest('.table_item__head')) {
                    let target = e.target.closest('.table_item');

                    !target.classList.contains('active') ? target.classList.add('active') : target.classList.remove('active');
                } else {
                    return;
                }
            });
        },
        objCatGrp: function(obj) {
            const coreObj = obj;
            let [txtCat, txtGrp] = ['cat', 'grp'];
            let setCat = new Set();
            let catArr = [];
            let totData = {}

            coreObj.forEach(objArr => setCat.add(objArr.cat));
            catArr = [...setCat];

            catArr.forEach(catVal => {
                totData[catVal] = {};
                let setGrp = new Set();
                let grpArr = [];

                coreObj.forEach(objArr => {
                    if (objArr[txtCat] === catVal) setGrp.add(objArr[txtGrp]);
                });

                grpArr = [...setGrp];
                grpArr.forEach((grpVal, idx) => {
                    let filterData = coreObj.filter(value => value[txtGrp] === grpVal).map(value => Object.entries(value));
                    let setObj = {};
                    
                    for (let j=0; j<filterData[0].length; j++) {
                        for (let i=0; i<filterData.length; i++) {
                            if (filterData[i][j][0].indexOf('optCd') !== -1 && filterData[i][j][1] !== '-') {
                                if (!Object.hasOwn(setObj, filterData[i][j][0])) setObj[filterData[i][j][0]] = [];
                                if (!setObj[filterData[i][j][0]].includes(filterData[i][j][1])) setObj[filterData[i][j][0]].push(filterData[i][j][1]);
                            }
                        }
                    }

                    totData[catVal][grpVal] = setObj;
                });
            });

            // console.log(totData);
            return totData;
        }
    }

    document.querySelector('.btb2').addEventListener('click', (e) => {
        let area3Core = area3.value.split('\n');
        area3Core.shift();
        area3Core.pop();
        if (area3Core[area3Core.length-1]==='') area3Core.pop();
        let coreStr = '';
        area3Core.forEach((v,i)=> {
            v=v.trim();
            let t=v;
            t=t.replace(/\":\"/g,'":"\t');
            t=t.replace(/\",\"/g,'","\t');
            t=t.replace(/\"},/g,'"},\n');
            i!==area3Core.length-1?t=t.replace(/\",},/g,'\n'):t=t.replace(/\",},/g,'');
            if (i===area3Core.length-1) t=t.replace(/\"}/g,'');
            coreStr += t;
        });
        area4.innerHTML = coreStr;
    });

    commonFunc.init();
    clipboard.addEventListener('click', copyText);

    // localStorage.setItem("groupChk", 10);
    // let n = localStorage.getItem("groupChk");
    // console.log(n);
});
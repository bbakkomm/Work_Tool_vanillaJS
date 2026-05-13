/**
 * setDataOption_buying v1.1 - 2뎁스
 * 작성자 : Jacob
 * 작성일 : 2025-11-05
 * 수정일 : 2025-11-05
 */

import ai_buyingData_17 from "../data/ai_data_3_2depth_17.json";
import { setDataTool } from './modules/setDataTool';
import { PT_STATE, util as _ } from './modules/bs_common';

/* ---------------------------------------------
 *  인스턴스 생성
 *  - setDataTool: 원시 JSON을 카테고리/그룹/머지 구조로 변환
 *  - buyingAI.mergeData : { [cat]: { [grp]: { def, active, items, unique?, config? } } }
 * 
 *  - 바잉툴 이용 방법: #id는 페이지 내 고유 값이므로, 변경 후 사용 / .클래스는 유지
 * --------------------------------------------- */

let [dep1_TabContainer, dep1_TabSwiper, mainContainerSelector] = ['#pt_ai_dept_2dep-17', '.pt_ai_dept__wrap', '#aiBuying_2depth_container-17'];
let [dep2_TabSwiper] = ['.pt_ai_category__wrap'];

let buyingAI_2dep_17_0 = new setDataTool('#aiBuying_2dep_17_0', '#pt_ai_category_2dep_17_0', '#pt_ai_contents_2dep_17_0', ai_buyingData_17);
let buyingAI_2dep_17_1 = new setDataTool('#aiBuying_2dep_17_1', '#pt_ai_category_2dep_17_1', '#pt_ai_contents_2dep_17_1', ai_buyingData_17);
let buyingAI_2dep_17_2 = new setDataTool('#aiBuying_2dep_17_2', '#pt_ai_category_2dep_17_2', '#pt_ai_contents_2dep_17_2', ai_buyingData_17);
let buyingAI_2dep_17_3 = new setDataTool('#aiBuying_2dep_17_3', '#pt_ai_category_2dep_17_3', '#pt_ai_contents_2dep_17_3', ai_buyingData_17);
let buyingAI_2dep_17_4 = new setDataTool('#aiBuying_2dep_17_4', '#pt_ai_category_2dep_17_4', '#pt_ai_contents_2dep_17_4', ai_buyingData_17);
let buyingAI_2dep_17_5 = new setDataTool('#aiBuying_2dep_17_5', '#pt_ai_category_2dep_17_5', '#pt_ai_contents_2dep_17_5', ai_buyingData_17);
let buyingAI_2dep_17_6 = new setDataTool('#aiBuying_2dep_17_6', '#pt_ai_category_2dep_17_6', '#pt_ai_contents_2dep_17_6', ai_buyingData_17);

/* ---------------------------------------------
 *  core 유틸/렌더/이벤트/업데이트 묶음
 * --------------------------------------------- */
let core = {
    /* 유효값 체크: '-', null 등은 제외 */
    valid: v => v && v !== '-',

    /* 후보 수집: 현재 filtered 아이템에서 key(예: 'optCdA')의 가능한 코드 목록 */
    getCandidates(items, key) {
        const s = new Set();
        for (const it of items) if (core.valid(it[key])) s.add(it[key]);
        return [...s];
    },

    /* 옵션 박스 렌더: 후보가 없으면 숨김, 있으면 표시 + 후보 외 버튼 비활성화 */
    renderOptBox($box, candidates) {
        if (!candidates.length) {
            $box.hide();
            $box.find('.on').removeClass('on'); // 이전 선택 해제
            return;
        }
        $box.show();

        $box.find('[data-tool-item-opt]').each(function(){
            const $opt = $(this);
            const code = $opt.find('input').val();
            if (candidates.includes(code)) {
                $opt.removeClass('is-disabled');
            } else {
                $opt.addClass('is-disabled').removeClass('on'); // 후보가 아니면 비활성/선택 해제
            }
        });
    },

    /* 뎁스 목록: 뎁스 필터 후 유니크 목록 리턴 */
    dataFilterUnique: (data, searchKey) => {
        const lawData = data.result === undefined ? data : data.result; // Type: Array
        let setData = new Set();

        try {
            lawData.forEach(v => !setData.has(v[searchKey]) ? setData.add(v[searchKey]) : '');
        } catch (error) {
            console.error(`"${searchKey}"가 존재하지 않거나 올바른 값이 아닙니다`);
        }

        return [...setData];
    },

    /* "-" 없음 분기처리: none logic */
    isDataChk: (data) => {
        const d = data;
        
        return d === undefined || d === '-';
    },

    /* ---------------------------------------------
     *  setDept: 카테고리 상위 1뎁스 탭, 1뎁스 탭 + 컨텐츠 이벤트 바인딩
     * --------------------------------------------- */
    setDept: (deptEle, swiperSelector, mainContainerEle, data) => {
        const deptArr = core.dataFilterUnique(data, 'dept'); // 1뎁스 배열
        const _deptEle = $(deptEle);
        const _mainContainerEle = $(mainContainerEle); // 최상단 컨테이너

        const contentsItems = _mainContainerEle.find('.sec_ai_buying_2dep');
        const deptTabItems = _deptEle.find('.pt_ai_dept__item');
        const deptTabItemFirstIdx = _deptEle.find('.pt_ai_dept__item.on').index(); // 최초 on 인덱스

        // 초기 실행
        core.ctgSwiper(swiperSelector, _deptEle);
        contentsItems.eq(deptTabItemFirstIdx).addClass('on').siblings().removeClass('on');
        // console.info("초기실행", deptEle);

        // 탭 클릭 이벤트 바인딩
        deptTabItems.on('click', function() {
            // console.info("click");
            const $this = $(this);
            const onIdx = $this.index();

            $this.addClass('on').siblings().removeClass('on');
            contentsItems.eq(onIdx).addClass('on').siblings().removeClass('on');
        });
    },

    /* ---------------------------------------------
     *  setOpt: mergeData에 unique 옵션(색상/옵션A/B) 목록 생성
     *  - UI 렌더링 시 라디오버튼 목록에 사용
     * --------------------------------------------- */
    setOpt: (cls) => {
        let _clsObj = cls.mergeData;

        for (const [ctgKey, ctgItem] of Object.entries(_clsObj)) {
            for (const [grpKey, grpItem] of Object.entries(ctgItem)) {
                const items = grpItem.items || [];

                let optCdCo_Set = new Set();
                let optCdA_Set = new Set();
                let optCdB_Set = new Set();

                // 아이템들에서 고유 옵션 수집(문자열 키로 중복 제거)
                for (const item of items) {
                    if (item?.optCdCo && item.optCdCo !== '-') optCdCo_Set.add(`${item.optCdCo}|${item.optCo}|${item.optNmCo}`);
                    if (item?.optCdA && item.optCdA !== '-') optCdA_Set.add(`${item.optCdA}|${item.optA}`);
                    if (item?.optCdB && item.optCdB !== '-') optCdB_Set.add(`${item.optCdB}|${item.optB}`);
                }

                if (!grpItem.unique) grpItem.unique = {};

                if (optCdCo_Set.size) grpItem.unique.optCdCo = [...optCdCo_Set];
                if (optCdA_Set.size)  grpItem.unique.optCdA = [...optCdA_Set];
                if (optCdB_Set.size)  grpItem.unique.optCdB = [...optCdB_Set];
            }
        }
    },

    /* ---------------------------------------------
     *  setHtml: 카테고리별 그룹 리스트 + 옵션 라디오 버튼 렌더
     *  - 컬러(optCdCo) 박스는 항상 위에, 나머지 옵션 박스는 그 다음
     * --------------------------------------------- */
    setHtml: (clsObj, categoryEle, contentsEle) => {
        const _clsObj = clsObj;
        const _categoryEle = categoryEle;
        const _contentsEle = contentsEle;
        // console.info(categoryEle, _clsObj.mergeData)

        let render = {
            /* 그룹 카드(html li) 렌더 */
            grp: (attr) => {
                const catAttr = attr;
                let html = '';


                for (const [key, value] of Object.entries(_clsObj.mergeData[catAttr])) {
                    const def = value.def;

                    html += `<li class="pt_ai_contents__item" data-tool-grp="${key}">
                                <div class="item__region item__region-top">
                                    <div class="item_tag__area">
                                        <p class="item_tag__area--txt" data-sync-key="cTag">${def.cTag}</p>
                                    </div>
                                    <div class="item_img__area">
                                        <div class="img_box pt_img_box">
                                            <img src="${def.thm}" alt="" loading="lazy" data-sync-key="thm"/>
                                        </div>
                                    </div>
                                </div>
                                <div class="item__region item__region-bottom">
                                    <div class="item_opt__area">${render.opt(key, value)}</div>
                                    <div class="item_txt__area">
                                        <p class="item_txt__area--tit" data-sync-key="pdNm">${def.pdNm}</p>
                                        <p class="item_txt__area--sku" data-sync-key="sku">${def.sku}</p>
                                    </div>
                                    <div class="item_price__area">
                                        <div class="item_price__area-box item_price__area-box--month">
                                            <p class="item_price-tit grey">월 납부 예상금액</p>
                                            <div class="item_price-num">
                                                <p class="item_price-num--txt"><span class="en" data-sync-key="cB">${def.cB}</span>원부터~</p>
                                                <button class="item_price-num--btn" data-tool-popup-btn data-tool-num-popup-btn data-omni-type="microsite" data-omni="sec:event:ai-subs-festa:popup_price-${def.sku}">팝업 버튼</button>
                                            </div>
                                            
                                            <div class="item_price-popup" data-tool-popup-content data-tool-num-popup-content>
                                                <p class="item_price-popup-tit">AI 올인원 2.0 가입 시</p>
                                                <ul class="item_price-popup-contents">
                                                    <li class="item_price-ct-li">
                                                        <p class="item_price-ct-li--tit grey">총 구독금액</p>
                                                        <p class="item_price-ct-li--num grey"><span class="en" data-sync-key="cA">${def.cA}</span>원</p>
                                                    </li>
                                                    <li class="item_price-ct-li">
                                                        <p class="item_price-ct-li--tit basic">월 납부 예상금액</p>
                                                        <p class="item_price-ct-li--num basic"><span class="en" data-sync-key="cB">${def.cB}</span>원~</p>
                                                    </li>
                                                    
                                                </ul>
                                            </div>
                                            <div class="item_coalition-popup" data-tool-popup-content data-tool-coalition-popup-content>
                                                <p class="item_coalition-popup-tit">AI 구독클럽 제휴카드 혜택 적용</p>
                                                <div class="item_coalition-popup-contents">
                                                    <p class="item_coalition-popup-contents--txt">
                                                        삼성전자 AI 구독 삼성카드로 전월 실적 500만원 충족시 제공되는 혜택입니다. AI 올인원 2.0 요금제 기준이며, 구독케어 기간/유형/주기 및 제휴카드 변경, 전월 실적 충족 여부, 카드사 이벤트 등에 따라 금액은 달라질 수 있습니다.
                                                        <br/><br/>
                                                        카드 혜택은 해당 제휴카드로 결제 카드 등록 시에만 제공되는 혜택이며, 금액대별 결제 혜택은 카드 혜택 자세히 보기에서 확인할 수 있습니다.
                                                        <br/><br/>
                                                        최종 혜택 적용금액은 카드사를 통해 확인 가능합니다.
                                                    </p>
                                                </div>
                                                <div class="item_coalition-popup-exit">
                                                    <span class="line"></span>
                                                    <span class="line"></span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="item_price__area-box item_price__area-box--month" style="${core.isDataChk(def.cC) ? 'display: none;' : ''}">
                                            <p class="item_price-tit grey">특별 포인트</p>
                                            <div class="item_price-num">
                                                <p class="item_price-num--txt en"><span class="en" data-sync-key="cC">${core.isDataChk(def.cC) ? 0 : def.cC}</span>P</p>
                                            </div>
                                        </div>
                                        <div class="item_price__area-box item_price__area-box--month">
                                            <div class="item_price-tit">
                                                <p class="item_price-tit">AI 구독클럽 <br/>제휴카드 혜택 적용</p>
                                                <button class="item_price-tit--btn" data-tool-popup-btn data-tool-coalition-popup-btn data-omni-type="microsite" data-omni="sec:event:ai-subs-festa:popup_subs-price-${def.sku}">팝업 버튼</button>
                                            </div>
                                            <div class="item_price-num">
                                                <p class="item_price-num--txt item_price-num--txt item_price-num--txt-ai">월<span class="en" data-sync-key="cD"> ${core.isDataChk(def.cD) ? 0 : def.cD}</span>원~</p>
                                            </div>
                                            <div class="item_coalition-popup" data-tool-popup-content data-tool-coalition-popup-content>
                                                <p class="item_coalition-popup-tit">AI 구독클럽 제휴카드 혜택 적용</p>
                                                <div class="item_coalition-popup-contents">
                                                    <p class="item_coalition-popup-contents--txt">
                                                        삼성전자 AI 구독 삼성카드로 전월 실적 500만원 충족시 제공되는 혜택입니다. AI 올인원 2.0 요금제 기준이며, 구독케어 기간/유형/주기 및 제휴카드 변경, 전월 실적 충족 여부, 카드사 이벤트 등에 따라 금액은 달라질 수 있습니다.
                                                        <br/><br/>
                                                        카드 혜택은 해당 제휴카드로 결제 카드 등록 시에만 제공되는 혜택이며, 금액대별 결제 혜택은 카드 혜택 자세히 보기에서 확인할 수 있습니다.
                                                        <br/><br/>
                                                        최종 혜택 적용금액은 카드사를 통해 확인 가능합니다.
                                                    </p>
                                                </div>
                                                <div class="item_coalition-popup-exit">
                                                    <span class="line"></span>
                                                    <span class="line"></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="item_cta__area">
                                        <a href="${def.cUrl}" class="item_cta__area-btn item_cta__area-btn--link" data-omni-type="microsite" data-omni="sec:event:ai-subs-festa:goto_subs-${def.sku}" title="구독하기 페이지로 이동" data-sync-key="cUrl" data-sync-omni="link_cta1">구독하기</a>
                                    </div>
                                </div>
                            </li>`;
                }

                return html;
            },

            /* 옵션 박스 묶음 렌더: 컬러 우선 → 일반 옵션 */
            opt: (key, value) => {
                const unique = value.unique;
                let html = '';
                let basicOptHtml = '';
                let colorOptHtml = '';

                for (const [uniqueKey, uniqueValue] of Object.entries(unique)) {
                    if (uniqueKey === 'optCdCo') {
                        colorOptHtml += `<div class="item_opt__area-box" data-tool-optkey="${uniqueKey}">
                                            ${render.radioBtn(key, value, uniqueKey, uniqueValue)}
                                        </div>`;
                    } else {
                        basicOptHtml += `<div class="item_opt__area-box" data-tool-optkey="${uniqueKey}">
                                            ${render.radioBtn(key, value, uniqueKey, uniqueValue)}
                                        </div>`;
                    }
                }

                html += colorOptHtml;
                html += basicOptHtml;
                return html;
            },

            /* 라디오 버튼 렌더(일반/컬러) */
            radioBtn: (key, value, uniqueKey, uniqueValue) => {
                const _value = value;
                let html = '';

                if (uniqueKey === 'optCdA' || uniqueKey === 'optCdB') {
                    // 일반 옵션: code|name
                    for (const it of uniqueValue) {
                        const [optCd, optNm] = it.split('|');
                        const isActive = optCd === _value.def[uniqueKey];

                        html += `<div class="item_opt__area--opt area-basic ${isActive ? 'on' : ''}" data-tool-item-opt>
                                    <input type="radio" id="item_opt_${uniqueKey}_${key}_${optCd}" name="item_opt_${uniqueKey}_${key}" value="${optCd}" ${isActive ? 'checked' : ''}/>
                                    <label for="item_opt_${uniqueKey}_${key}_${optCd}">
                                        <p class="pt_opt_txt">${optNm}</p>
                                    </label>
                                </div>`;
                    }
                } else if (uniqueKey === 'optCdCo') {
                    // 컬러 옵션: code|chip|name
                    for (const it of uniqueValue) {
                        const [optCdCo, optCo, optNmCo] = it.split('|');
                        const isActive = optCdCo === _value.def[uniqueKey];

                        html += `<div class="item_opt__area--opt area-color ${isActive ? 'on' : ''}" data-tool-item-opt>
                                    <input type="radio" id="item_opt_${uniqueKey}_${key}_${optCdCo}" name="item_opt_${uniqueKey}_${key}" value="${optCdCo}" ${isActive ? 'checked' : ''}/>
                                    <label for="item_opt_${uniqueKey}_${key}_${optCdCo}">
                                        <p class="pt_opt_txt">${optNmCo}</p>
                                    </label>
                                </div>`;
                    }
                }
                return html;
            }
        }

        // 카테고리 탭 버튼을 순회하며, 카테고리별 콘텐츠 UL 렌더
        let contentsHtml = '';
        _categoryEle.find('[data-tool-cat-btn]').each(function() {
            const attr = $(this).find('[data-tool-cat-nm]').attr('data-tool-cat-nm');
            contentsHtml += `<ul class="pt_ai_contents__list" data-tool-cat="${attr}">${render.grp(attr)}</ul>`;
        });

        _contentsEle.html(contentsHtml);
    },

    /* ---------------------------------------------
     *  setCatContSync: 카테고리 탭(on)과 콘텐츠 표시 동기화
     * --------------------------------------------- */
    setCatContSync: (clsObj, categoryEle, contentsEle) => {
        const _categoryEle = categoryEle;
        const _contentsEle = contentsEle;

        const activeCat = _categoryEle.find('[data-tool-cat-btn].on [data-tool-cat-nm]').attr('data-tool-cat-nm');
        const ContentItems = _contentsEle.find('[data-tool-cat]');

        ContentItems.each(function() {
            const $this = $(this);
            const attr = $this.attr('data-tool-cat');
            attr === activeCat ? $this.addClass('on') : $this.removeClass('on');
        });
    },

    /* ---------------------------------------------
     *  setAction: 탭 클릭/옵션 클릭 이벤트 바인딩
     *  - 옵션 클릭 시 activeUpdate 호출
     * --------------------------------------------- */
    setAction: (clsObj, categoryEle, contentsEle) => {
        const _clsObj = clsObj;
        const _categoryEle = categoryEle;
        const _contentsEle = contentsEle;

        // 카테고리 탭 클릭
        _categoryEle.find('[data-tool-cat-nm]').on('click', function() {
            const attr = $(this).attr('data-tool-cat-nm');
            const parentEl = $(this).closest('[data-tool-cat-btn]');

            parentEl.addClass('on').siblings().removeClass('on');
            _contentsEle.find(`[data-tool-cat="${attr}"]`).addClass('on').siblings().removeClass('on');
        });

        // 옵션 버튼 클릭(라벨 클릭 기준)
        _contentsEle.find('[data-tool-item-opt] label').on('click', function() {
            const itemOptBtn = $(this).closest('[data-tool-item-opt]');
            // 같은 박스 내 단일 선택
            itemOptBtn.addClass('on').siblings().removeClass('on');

            core.activeUpdate(_clsObj, itemOptBtn);
        });

        // 월 납부금액 CTA 클릭(화살표 CTA 클릭 기준)
        // _contentsEle.find('[data-tool-num-popup-btn]').on('click', function() {
        //     e.stopPropagation();
        //     const $this = $(this);
        //     const itemGrp = $this.closest('[data-tool-grp]');
        //     const itemPopupContent = itemGrp.find('[data-tool-num-popup-content]');

        //     !$this.hasClass('on') ? $this.addClass('on') : $this.removeClass('on');
        //     !itemPopupContent.hasClass('on') ? itemPopupContent.addClass('on') : itemPopupContent.removeClass('on');
        // });

        // ======================== 공통 유틸 ========================
        function resetPopupStyle($popup){ $popup.css({left:'', right:'', top:'', bottom:'', transform:''}); }

        function adjustTooltipPosition($popup){
            if(!$popup || !$popup.length) return;

            const rect = $popup[0].getBoundingClientRect();
            const vw = window.innerWidth;

            // 화면 중앙을 기준으로 왼쪽/오른쪽 카드 판단
            const isLeftCard = rect.left + rect.width / 2 < vw / 2;

            // 화면 바깥으로 나간 경우 우선 보정
            if (rect.left < 0) {
                $popup.css({ left: 0, right: 'auto', transform: 'none' });
            } else if (rect.right > vw) {
                $popup.css({ right: 0, left: 'auto', transform: 'none' });
            } else {
                // 모바일 2열 구조일 때 위치 강제
                if (_.isMobile()) { // 반응형 기준에 맞게 조정
                    if (isLeftCard) {
                        // 왼쪽 카드
                        $popup.css({ left: 0, right: 'auto', transform: 'none' });
                    } else {
                        // 오른쪽 카드
                        $popup.css({ right: 0, left: 'auto', transform: 'none' });
                    }
                } else {
                    // 데스크탑에서는 원래 위치 유지
                    $popup.css({ left: '', right: '', transform: '' });
                }
            }
        }

        // 월 혜택 팝업
        _contentsEle.find('[data-tool-num-popup-btn]').on('click', function(e) {
            e.stopPropagation();
            const $this = $(this);
            const itemGrp = $this.closest('[data-tool-grp]');
            const itemPopupContent = itemGrp.find('[data-tool-num-popup-content]');

            const isOpen = $this.hasClass('on');

            //모든 팝업/버튼 닫기
            $('[data-tool-popup-btn].on').removeClass('on');
            $('[data-tool-popup-content].on').removeClass('on');

            if (!isOpen) {
                //현재 버튼/팝업만 열기
                $this.addClass('on');
                itemPopupContent.addClass('on');

                //바깥 클릭 시 닫기
                $(document).off('click.popupClose').on('click.popupClose', function(ev) {
                    const $target = $(ev.target);

                    if (
                        !$target.closest('[data-tool-num-popup-btn]').length &&
                        !$target.closest('[data-tool-num-popup-content]').length
                    ) {
                        $('[data-tool-num-popup-btn].on').removeClass('on');
                        $('[data-tool-num-popup-content].on').removeClass('on');
                        $(document).off('click.popupClose');
                    }

                    resetPopupStyle(itemPopupContent);
                });

                requestAnimationFrame(() => adjustTooltipPosition(itemPopupContent));
            } else {
                // 이미 열려있으면 닫기 → document 이벤트 제거
                $(document).off('click.popupClose');
                resetPopupStyle(itemPopupContent);
            }
        });

        // 제휴카드 혜택 팝업
        _contentsEle.find('[data-tool-coalition-popup-btn]').on('click', function(e) {
            e.stopPropagation();
            const $this = $(this);
            const itemGrp = $this.closest('[data-tool-grp]');
            const itemPopupContent = itemGrp.find('[data-tool-coalition-popup-content]');

            const isOpen = $this.hasClass('on');

            //모든 팝업/버튼 닫기
            $('[data-tool-popup-btn].on').removeClass('on');
            $('[data-tool-popup-content].on').removeClass('on');

            if (!isOpen) {
                //현재 버튼/팝업만 열기
                $this.addClass('on');
                itemPopupContent.addClass('on');

                //바깥 클릭 시 닫기
                $(document).off('click.popupClose').on('click.popupClose', function(ev) {
                    const $target = $(ev.target);

                    if (
                        !$target.closest('[data-tool-coalition-popup-btn]').length &&
                        !$target.closest('[data-tool-coalition-popup-content]').length
                    ) {
                        $('[data-tool-coalition-popup-btn].on').removeClass('on');
                        $('[data-tool-coalition-popup-content].on').removeClass('on');
                        $(document).off('click.popupClose');
                    }
                    
                    resetPopupStyle(itemPopupContent);
                });

                //닫기 클릭 시 닫기
                $(document).off('click.item_coalition-popup-exit').on('click.item_coalition-popup-exit', function(ev) {
                    const $target = $(ev.target);

                    $('[data-tool-coalition-popup-btn].on').removeClass('on');
                    $('[data-tool-coalition-popup-content].on').removeClass('on');
                    $(document).off('click.item_coalition-popup-exit');
                    resetPopupStyle(itemPopupContent);
                });

                requestAnimationFrame(() => adjustTooltipPosition(itemPopupContent));
            } else {
                // 이미 열려있으면 닫기 → document 이벤트 제거
                $(document).off('click.popupClose');
                resetPopupStyle(itemPopupContent);
            }
        });
    },

    /* ---------------------------------------------
     *  setMore: 더보기 
     *  - 디바이스 체크: 폴드 O ? 개수 : 모바일 O ? 개수 : PC O, 개수
     *  - 
     *  -
     *  -
     * --------------------------------------------- */
    setMore: (mainContainerSelector) => {
        // PC, FOLD, MO 처음 노출되는 아이템 개수 설정
        const [firstNumCnt_PC, firstNumCnt_FOLD, firstNumCnt_MO] = [8, 8, 4]; 
        const firstMoreCnt = _.isFold() ? firstNumCnt_FOLD : _.isMobile() ? firstNumCnt_MO : firstNumCnt_PC;

        // PC, FOLD, MO 더보기 아이템 개수 설정
        const [numCnt_PC, numCnt_FOLD, numCnt_MO] = [8, 8, 4]; 
        const moreCnt = _.isFold() ? numCnt_FOLD : _.isMobile() ? numCnt_MO : numCnt_PC;

        const _mainContainer = $(mainContainerSelector);

        const moreBtn = _mainContainer.find('[data-tool-core-btn="more"]');
        const mainDeptBtns = _mainContainer.find('[data-tool-dept-btn]');
        const mainCatBtns = _mainContainer.find('[data-tool-cat-btn]');
        const cateLists = _mainContainer.find('[data-tool-cat]');

        // 초기 세팅 =s
        cateLists.each(function(cIdx, cThis) {
            const $cThis = $(cThis);
            const grpLists = $cThis.find('[data-tool-grp]');
            
            grpLists.each(function(gIdx, gThis) {
                const $gThis = $(gThis);
                
                if (firstMoreCnt <= gIdx) {
                    $gThis.addClass('blind');
                }
            });
        });

        checkOnItem();
        // 초기 세팅 =e
        
        // 더보기 클릭 시
        moreBtn.on('click', function(e) {
            // const deptOnAttr = _mainContainer.find('[data-tool-dept-btn].on').find('[data-tool-dept-nm]').attr('data-tool-dept-nm');
            // const catOnAttr = _mainContainer.find('[data-tool-cat-btn].on').find('[data-tool-cat-nm]').attr('data-tool-cat-nm');
            
            const OnItem = _mainContainer.find('[data-cat-item].on').find('[data-tool-cat].on');
            const ItemGrpBlinds = OnItem.find('[data-tool-grp].blind');

            ItemGrpBlinds.each(function(i, gThis) {
                if (i >= moreCnt) return false;

                $(gThis).removeClass('blind');
            });

            checkOnItem();
        });

        // 1depth, 2depth 버튼 클릭 시
        mainDeptBtns.on('click', checkOnItem);
        mainCatBtns.on('click', checkOnItem);

        function checkOnItem() {
            const OnItem = _mainContainer.find('[data-cat-item].on').find('[data-tool-cat].on');
            const ItemAllGrps = OnItem.find('[data-tool-grp]');
            const ItemGrps = OnItem.find('[data-tool-grp]').not('.blind');
            const ItemGrpBlinds = OnItem.find('[data-tool-grp].blind');

            const PageNum = Math.floor(ItemGrps.length / moreCnt);
            const allPageNum = Math.ceil(ItemAllGrps.length / moreCnt);

            ItemGrpBlinds.length > 0 ? moreBtn.removeClass('blind') : moreBtn.addClass('blind');
            
            moreBtn.html(`더보기 <span>${PageNum}/${allPageNum}</span>`);
        };
    },
    
    /* ---------------------------------------------
     *  activeUpdate: 유동 옵션 + 컬러 최상위 + 자동선택 로직
     *  - DOM에서 현재 선택 상태를 읽고
     *  - 단계적으로 후보 계산/표시/자동선택
     *  - 최종 필터 결과로 active SKU 갱신
     * --------------------------------------------- */
    activeUpdate: (clsObj, itemOptBtn) => {
        const _clsObj = clsObj;
        const $btn = itemOptBtn;

        const optCatAttr = $btn.closest('[data-tool-cat]').attr('data-tool-cat');
        const optGrpAttr = $btn.closest('[data-tool-grp]').attr('data-tool-grp');
        const $grp = $btn.closest('[data-tool-grp]');
        const node = _clsObj.mergeData[optCatAttr][optGrpAttr];
        const allItems = node.items || [];

        // 그룹별 strictChain (없으면 true)
        const strictChain = node.config?.strictChain ?? true;

        // 옵션 키 순서 (DOM → 컬러 있으면 최상위로)
        let optKeys = $grp.find('[data-tool-optkey]').map(function(){
            return $(this).attr('data-tool-optkey');
        }).get();

        const hasColor = optKeys.includes('optCdCo');
        if (hasColor) {
            optKeys = ['optCdCo', ...optKeys.filter(k => k !== 'optCdCo')];
        }

        // 현재 선택값 수집: { optCdCo?, optCdA?, optCdB?, ... }
        const selection = {};
        $grp.find('.on[data-tool-item-opt]').each(function(){
            const key = $(this).closest('[data-tool-optkey]').attr('data-tool-optkey');
            const val = $(this).find('input').val();

            selection[key] = val;
        });

        // 단계적 필터링/표시
        let filtered = allItems;

        for (let i = 0; i < optKeys.length; i++) {
            const key = optKeys[i];
            const $box = $grp.find(`[data-tool-optkey="${key}"]`);

            // [컬러 존재] 컬러가 미선택이면 아래 단계는 숨김
            if (hasColor && key !== 'optCdCo' && !selection.optCdCo) {
                $box.hide();
                continue;
            }

            // [컬러 없음] strictChain이면 상위 미선택 시 숨김
            if (!hasColor && strictChain) {
                const prevKeys = optKeys.slice(0, i);
                const prevAllChosen = prevKeys.every(k => !!selection[k]);

                if (!prevAllChosen) {
                    $box.hide();
                    continue;
                }
            }

            // 후보 계산 후 박스 렌더/비활성 처리
            const candidates = core.getCandidates(filtered, key);
            core.renderOptBox($box, candidates);

            // 기존 선택이 후보에 없으면 해제
            const chosen = selection[key];
            if (chosen && !candidates.includes(chosen)) {
                $box.find('.on').removeClass('on');
                delete selection[key];
            }

            // 자동 선택 규칙
            // 1) 후보가 1개뿐이면 자동 선택
            if (!selection[key] && candidates.length === 1) {
                selection[key] = candidates[0];
            }
            // 2) 여전히 없다면 def가 후보에 있으면 def로 선택
            if (!selection[key]) {
                const defCode = node.def?.[key];

                if (defCode && defCode !== '-' && candidates.includes(defCode)) {
                    selection[key] = defCode;
                }
            }
            // 3) (선택) 그래도 없고 후보가 1개 이상이면 첫 후보 선택
            if (!selection[key] && candidates.length > 0) {
                selection[key] = candidates[0];
            }

            // DOM에 선택 반영(on/checked)
            if (selection[key]) {
                const $opt = $box.find(`[data-tool-item-opt] input[value="${selection[key]}"]`).closest('[data-tool-item-opt]');

                $box.find('[data-tool-item-opt]').removeClass('on');
                $opt.addClass('on');
                $opt.find('input').prop('checked', true);
            }

            // 다음 단계 필터 좁히기
            if (selection[key]) {
                filtered = filtered.filter(it => it[key] === selection[key]);
            }
        }

        // 최종 active SKU 결정
        if (filtered.length >= 1) {
            node.active = filtered[0]; // 1개면 그 SKU, 여러 개면 첫 번째(필요시 정렬/우선순위 적용)
        } else {
            node.active = node.def;    // 조합 불가 시 기본값
        }

        core.contentsUpdate(node, $btn);
    },

    /* active 값으로 가격/이미지/텍스트 갱신 */
    contentsUpdate: (node, btn) => {
        const data = node.active;                     // 현재 활성 SKU 데이터
        const $grp = btn.closest('[data-tool-grp]');

        /* 동기화 대상 요소들 =s */
        const syncEle = $grp.find('[data-sync-key]'); 
        
        // key → 갱신 함수 매핑
        const syncMap = {
            cTag: ($el, v) => $el.html(v),           // 상단 태그
            thm : ($el, v) => $el.attr('src', v),    // 썸네일
            pdNm: ($el, v) => $el.html(v),           // 제품명
            sku : ($el, v) => $el.html(v),           // SKU
            cA  : ($el, v) => $el.text(v),           // 총 구독금액
            cB  : ($el, v) => $el.text(v),           // 월 납부 예상금액
            cUrl: ($el, v) => $el.attr('href', v),   // 구독하기 CTA URL
        };

        // 각 요소별 동기화 실행
        syncEle.each(function() {
            const key = $(this).attr('data-sync-key');
            const val = data[key];
            if (syncMap[key] && val !== undefined && val !== '-') {
                syncMap[key]($(this), val);
            }
        });
        /* 동기화 대상 요소들 =e */

        /* 옴니 동기화 대상 요소들 =s */
        const syncOmni = $grp.find('[data-sync-omni]');

        // key → 갱신 함수 매핑
        const syncMapOmni = {
            link_cta1: ($el, v) => $el.attr('data-omni', `sec:event:super-deal:goto_subs-${v}`),    // 링크 CTA - SKU
        };

        syncOmni.each(function() {
            const key = $(this).attr('data-sync-omni');
            const val = data.sku;
            if (syncMapOmni[key] && val !== undefined && val !== '-') {
                syncMapOmni[key]($(this), val);
            }
        });
        /* 옴니 동기화 대상 요소들 =e */
        
        // console.log(node, btn); // 디버깅용
    },
    /* 카테고리 탭 Swiper 적용 */
    ctgSwiper: (swiperContainerSelector, containerEle, clsObj) => {
        const _clsObj = clsObj;
        const _containerEle = containerEle;
        const swiperContainer = _containerEle.find(swiperContainerSelector);

        const execSwiper = new Swiper(swiperContainer, {
            slidesPerView: 'auto',
            freeMode: true,
            allowTouchMove: true,
            watchOverflow : true,
            observer: true,
            observeParents: true,
            observeSlideChildren: true,
            navigation: {
                nextEl: ".pt_buying_menu .swiper-button-next",
                prevEl: ".pt_buying_menu .swiper-button-prev",
            },
            breakpoints: {
                802: {
                    allowTouchMove: false
                }
            },
            on: {
                breakpoint: function() {
                    let _self = this;

                    setTimeout(function() {
                        _self.slideTo(0, 0);
                    }, 150);
                },
            },
        })
    },

    /* ---------------------------------------------
     *  초기 구동: unique 생성 → HTML 렌더 → 탭/옵션 이벤트 바인딩
     * --------------------------------------------- */
    init: (clsObj, containerEle, categoryEle, contentsEle, mainContainerSelector) => {
        core.ctgSwiper(dep2_TabSwiper, categoryEle, clsObj);
        core.setOpt(clsObj);
        core.setHtml(clsObj, categoryEle, contentsEle);
        core.setCatContSync(clsObj, categoryEle, contentsEle);
        core.setAction(clsObj, categoryEle, contentsEle);
        
        // console.log(clsObj);
    }
}

$(document).ready(function() {
    core.init(buyingAI_2dep_17_0, buyingAI_2dep_17_0.$el, buyingAI_2dep_17_0.$CateGoryEl, buyingAI_2dep_17_0.$ContentsEl, mainContainerSelector);
    core.init(buyingAI_2dep_17_1, buyingAI_2dep_17_1.$el, buyingAI_2dep_17_1.$CateGoryEl, buyingAI_2dep_17_1.$ContentsEl, mainContainerSelector);
    core.init(buyingAI_2dep_17_2, buyingAI_2dep_17_2.$el, buyingAI_2dep_17_2.$CateGoryEl, buyingAI_2dep_17_2.$ContentsEl, mainContainerSelector);
    core.init(buyingAI_2dep_17_3, buyingAI_2dep_17_3.$el, buyingAI_2dep_17_3.$CateGoryEl, buyingAI_2dep_17_3.$ContentsEl, mainContainerSelector);
    core.init(buyingAI_2dep_17_4, buyingAI_2dep_17_4.$el, buyingAI_2dep_17_4.$CateGoryEl, buyingAI_2dep_17_4.$ContentsEl, mainContainerSelector);
    core.init(buyingAI_2dep_17_5, buyingAI_2dep_17_5.$el, buyingAI_2dep_17_5.$CateGoryEl, buyingAI_2dep_17_5.$ContentsEl, mainContainerSelector);
    // core.init(buyingAI_2dep_17_6, buyingAI_2dep_17_6.$el, buyingAI_2dep_17_6.$CateGoryEl, buyingAI_2dep_17_6.$ContentsEl, mainContainerSelector);
    
    core.setDept(dep1_TabContainer, dep1_TabSwiper, mainContainerSelector, ai_buyingData_17);
    core.setMore(mainContainerSelector);
});

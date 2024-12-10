/* 
  buyingChecker - v0.1

  updatedAt: 2024-11-05
  updatedBy: jacob

  createdAt: 2024-11-05
  createdBy: jacob
*/

export const buyingChecker = {
    init() {
        if (window.location.search.includes('check=buying')) {
            let html = `
                <div class="buying_checker" 
                    style="
                        position: fixed; top: 10px; right: 10px; z-index: 999; 
                        min-width: 500px; max-width: max-content; height: auto; background-color: #fff; padding: 10px; border-radius: 20px; border: 1px solid #000; 
                        color: #000;
                        ">
                    <input type="text" class="buying_check_parent" value="" placeholder="바잉툴 ID를 입력해주세요." style="width: 100%; height: auto; border: 1px solid #999999; border-radius: 10px; font-size: 14px; padding: 5px 0; line-height: 1.3; margin-bottom: 10px;">
                    <textarea name="buying_check_area" id="buying_check_area" placeholder="optCheck JSON을 입력해주세요." style="width: 100%; height: 150px; border: 1px solid #999999; border-radius: 10px; font-size: 14px; padding: 5px; line-height: 1.3;"></textarea>
                    <button class="buying_check_btn" style="width: 100%; height: 50px; margin-top: 10px; background-color: #333; color: #fff; border-radius: 10px; font-weight: 700;">검색</button>
                    <div class="buying_check_info" style="line-height: 1.3; margin-top: 10px; overflow-y: auto; max-height: 500px;"></div>
                </div>
            `;
    
            $('main').append(html);
    
            let buyingChecker = $('.buying_checker');
            let buyingCheckParent = $('.buying_check_parent');
            let buyingCheckArea = $('#buying_check_area');
            let buyingCheckBtn = $('.buying_check_btn');
            let buyingCheckInfo = $('.buying_check_info');
            let buyingCheckLogic = '';
            let buyingCheckInfoText = '';
            let isColor = ['#2188ff', '#fa2337'];

            if (sessionStorage.getItem('checkId') !== null || sessionStorage.getItem('checkId') !== '') {
                buyingCheckParent.val(sessionStorage.getItem('checkId'));
            }

            if (sessionStorage.getItem('checkTextArea') !== null || sessionStorage.getItem('checkTextArea') !== '') {
                buyingCheckArea.val(sessionStorage.getItem('checkTextArea'));
            }
    
            buyingCheckBtn.on('click', function() {
                if (buyingCheckParent.val() === '') {
                    console.error('바잉툴 ID 값이 없어요');
                    sessionStorage.setItem('checkId', '');
                    buyingCheckInfo.html(`<b style="color: ${isColor[1]}">바잉툴 ID</b> 값이 없어요`);
                    return;
                }

                if (buyingCheckArea.val() === '') {
                    console.error('optCheck JSON 값이 없어요');
                    sessionStorage.setItem('checkTextArea', '');
                    buyingCheckInfo.html(`<b style="color: ${isColor[1]}">optCheck JSON</b> 값이 없어요`);
                    return;
                }
    
                if ($(`${buyingCheckParent.val()}`).length === 0) {
                    console.error('바잉툴 ID에 해당하는 태그가 없어요');
                    sessionStorage.setItem('checkId', buyingCheckParent.val());
                    buyingCheckInfo.html(`<b style="color: ${isColor[1]}">바잉툴 ID</b>에 해당하는 태그가 없어요`);
                    return;
                }

                try {
                    buyingCheckLogic = JSON.parse(buyingCheckArea.val());
                } catch (error) {
                    console.error('optCheck JSON 값이 올바르지 않아요');
                }

                let objEntry = Object.entries(buyingCheckLogic);
                let parentId = buyingCheckParent.val();
    
                for (let i=0; i<objEntry.length; i++) {
                    let [key, value] = [objEntry[i][0], objEntry[i][1]];
    
                    if ($(`${parentId} [data-opt-key=${key}]`).length !== 0) {
                        buyingCheckInfoText += `
                            <br/>====================================<br/><br/>
                            <b>${i+1}.</b> [data-opt-key=<b style="color: ${isColor[0]}">${key}</b>]가 있습니다. (<b style="color: ${isColor[0]}">O</b>)<br/>
                        `;
    
                        let dataOptKey = $(`${parentId} [data-opt-key=${key}]`);
                        let dataOptBtns = dataOptKey.find('[data-opt-btn]');
                        let noneBtnIdArr = [];
    
                        // data-opt-btn 버튼 개수 체크
                        if (dataOptBtns.length === value.length) {
                            buyingCheckInfoText += `${i+1}_. [data-opt-key=<b style="color: ${isColor[0]}">${key}</b>]의 <b style="color: ${isColor[0]}">[data-opt-btn]</b>와 <b style="color: ${isColor[0]}">JSON opt</b> 개수가 동일하여 <b style="color: ${isColor[0]}">정상</b>입니다. <br/>(<b>JSON</b>: <b style="color: ${isColor[0]}">${value.length}</b>개, <b>[data-opt-btn]</b>: <b style="color: ${isColor[0]}">${dataOptBtns.length}</b>개) (<b style="color: ${isColor[0]}">O</b>)<br/>`;
                            buyingCheckInfoText += `(<b>JSON</b>: ${value.join(', ')})<br/><br/>`;
    
                            // input 체크
                            for (let t=0; t<value.length; t++) {
                                let _elInput = $(`${parentId} [data-opt-key=${key}] input#${value[t]}`);
                                let _elLabel = _elInput.siblings(`label[for=${value[t]}]`);
                                let isName = _elInput.attr('name') === key;
                                let isValue = _elInput.val() === value[t];
                                let isRadio = _elLabel.siblings('input[type=radio]');
                                
                                if (_elInput.length === 1 && _elLabel.length === 1 && isName && isValue && isRadio.length === 1 && _elInput.closest('[data-opt-btn]').length != 0) {
                                    buyingCheckInfoText += `${i+1}_${t+1}. input type="<b style="color: ${isColor[0]}">radio</b>" name="<b style="color: ${isColor[0]}">${key}</b>" id="<b style="color: ${isColor[0]}">${value[t]}</b>" value="<b style="color: ${isColor[0]}">${value[t]}</b>"<br/>`;
                                    buyingCheckInfoText += `----. label for="<b style="color: ${isColor[0]}">${value[t]}</b>" 태그 구조가 <b style="color: ${isColor[0]}">정상</b>입니다.<br/>`;
                                } else {
                                    buyingCheckInfoText += `${i+1}_${t+1}. input type="<b style="color: ${isColor[1]}">radio</b>" name="<b style="color: ${isColor[1]}">${key}</b>" id="<b style="color: ${isColor[1]}">${value[t]}</b>" value="<b style="color: ${isColor[1]}">${value[t]}</b>"<br/>`;
                                    buyingCheckInfoText += `----. label for="<b style="color: ${isColor[1]}">${value[t]}</b>" 태그 구조가 <b style="color: ${isColor[1]}">존재하지 않거나 비정상</b>입니다. 옳지않은 <b style="color: ${isColor[1]}">type, name, id, for, value</b>가 적용되어 있습니다. 다시 확인해주세요.<br/>`;
                                }
                            }

                            if (value.length === dataOptBtns.length) {
                                dataOptBtns.each(function() {
                                    let attrId = $(this).find(`input[name=${key}]`).attr('id');
                                    if (!value.includes(attrId)) noneBtnIdArr.push(attrId);
                                });

                                if (noneBtnIdArr.length > 0) {
                                    noneBtnIdArr = noneBtnIdArr.join(', ');
                                    buyingCheckInfoText += `<b style="color: ${isColor[1]}">**. [${noneBtnIdArr}]</b>의 <b>ID를 적용한 [data-opt-btn]를 HTML에서 </b><b style="color: ${isColor[1]}">수정</b>해주세요<br/>`
                                }
                            }
                        } else {
                            buyingCheckInfoText += `${i+1}_. [data-opt-key=<b style="color: ${isColor[1]}">${key}</b>] ${key}의 <b style="color: ${isColor[1]}">[data-opt-btn]</b>와 <b style="color: ${isColor[1]}">JSON opt</b> 개수가 동일하지 않아 <b style="color: ${isColor[1]}">비정상</b>입니다. <br/>(<b>JSON</b>: <b style="color: ${isColor[0]}">${value.length}</b>개, <b>[data-opt-btn]</b>: <b style="color: ${isColor[1]}">${dataOptBtns.length}</b>개 / ${value.length < dataOptBtns.length ? `<b>data-opt-btn</b>의 <b>개수가 많아요</b>` : `<b>[data-opt-btn]</b>의 <b>개수가 모자라요</b>`}) (<b style="color: ${isColor[1]}">X</b>) <br/>`;
                            buyingCheckInfoText += `(<b>JSON</b>: ${value.join(', ')})<br/><br/>`;

                            // input 체크
                            for (let t=0; t<value.length; t++) {
                                let _elInput = $(`${parentId} [data-opt-key=${key}] input#${value[t]}`);
                                let _elLabel = _elInput.siblings(`label[for=${value[t]}]`);
                                let isName = _elInput.attr('name') === key;
                                let isValue = _elInput.val() === value[t];
                                let isRadio = _elLabel.siblings('input[type=radio]');
                                
                                if (_elInput.length === 1 && _elLabel.length === 1 && isName && isValue && isRadio.length === 1 && _elInput.closest('[data-opt-btn]').length != 0) {
                                    buyingCheckInfoText += `${i+1}_${t+1}. input type="<b style="color: ${isColor[0]}">radio</b>" name="<b style="color: ${isColor[0]}">${key}</b>" id="<b style="color: ${isColor[0]}">${value[t]}</b>" value="<b style="color: ${isColor[0]}">${value[t]}</b>"<br/>`;
                                    buyingCheckInfoText += `----. label for="<b style="color: ${isColor[0]}">${value[t]}</b>" 태그 구조가 <b style="color: ${isColor[0]}">정상</b>입니다.<br/>`;
                                } else {
                                    buyingCheckInfoText += `${i+1}_${t+1}. input type="<b style="color: ${isColor[1]}">radio</b>" name="<b style="color: ${isColor[1]}">${key}</b>" id="<b style="color: ${isColor[1]}">${value[t]}</b>" value="<b style="color: ${isColor[1]}">${value[t]}</b>"<br/>`;
                                    buyingCheckInfoText += `----. label for="<b style="color: ${isColor[1]}">${value[t]}</b>" 태그 구조가 <b style="color: ${isColor[1]}">존재하지 않거나 비정상</b>입니다. 옳지않은 <b style="color: ${isColor[1]}">type, name, id, for, value</b>가 적용되어 있습니다. 다시 확인해주세요.<br/>`;
                                }
                            }

                            if (value.length < dataOptBtns.length) {
                                dataOptBtns.each(function() {
                                    let attrId = $(this).find(`input[name=${key}]`).attr('id');
                                    if (!value.includes(attrId)) noneBtnIdArr.push(attrId);
                                });

                                noneBtnIdArr = noneBtnIdArr.join(', ');
                                buyingCheckInfoText += `<b style="color: ${isColor[1]}">**. [${noneBtnIdArr}]</b>의 <b>ID를 적용한 [data-opt-btn]를 HTML에서 </b><b style="color: ${isColor[1]}">수정</b>해주세요<br/>`
                            }
                        }
                    } else {
                        buyingCheckInfoText += `<br/><b>${i+1}.</b> [data-opt-key=<b style="color: ${isColor[1]}">${key}</b>]가 없습니다. (X) <br/>`;
                    }
                }
    
                buyingCheckInfo.html('');
                buyingCheckInfo.html(buyingCheckInfoText);
                buyingCheckInfoText = '';

                sessionStorage.setItem('checkId', buyingCheckParent.val());
                sessionStorage.setItem('checkTextArea', buyingCheckArea.val());
            });
        }
    }
};
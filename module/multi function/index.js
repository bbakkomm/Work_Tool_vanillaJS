conditionTransfer(_buying, _$this, data) {
    /**
     * 다중 조건문 수식 : Boolean으로 반환 (true or false)
     * @param {class} _buying 바잉툴 클래스
     * @param {$(this)} _$this each => $(this)
     * @param {string} data eventState value 값
     */
    // let cond_Container = _$this.attr(data).trim().replace(/ /g,'');
    let cond_Container = _$this.attr(data).trim();
    let center_Cond_Arr = cond_Container.match(/&&|\|\|/g);
    let child_Cond_Arr = cond_Container.split(/&&|\|\|/g);
    let result = null;
    
    child_Cond_Arr = child_Cond_Arr.map(text => {
        let txt_Boolean;
        if (text.includes('==')) {
            const [key, value] = text.split('==');
            txt_Boolean = _buying.state.selected[key] === value;
        } else if (text.includes('!=')) {
            const [key, value] = text.split('!=');
            txt_Boolean = _buying.state.selected[key] !== value;
        }

        return txt_Boolean;
    });

    let condtionResult = child_Cond_Arr[0];
    if (1 < child_Cond_Arr.length) {
        for (let i=1; i<child_Cond_Arr.length; i++) {
            if (center_Cond_Arr[i-1] === '&&') condtionResult = condtionResult && child_Cond_Arr[i];
            else if (center_Cond_Arr[i-1] === '||') condtionResult = condtionResult || child_Cond_Arr[i];
        }
        result = condtionResult;
    } else {
        result = condtionResult;
    }

    return result;
}

// 다중 조건 show mapping
try {
    $secWrap.find('[data-case-show]').each(function(){
        // conditionTransfer(_buying, _$this, data);
        if (buyingUtil.conditionTransfer(buying, $(this), 'data-case-show')) {
            $(this).removeClass('pt_sam_hide');
        } else {
            $(this).addClass('pt_sam_hide');
        }
    });
} catch (e) { console.error(e); }
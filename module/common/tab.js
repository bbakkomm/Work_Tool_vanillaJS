import { PT_STATE, util as _} from './bs_common';

export const tab = {
    /**
     * 탭 버튼 클릭시 해당 타겟 show 하는 함수
     * @param {object} params {'target': str, 'default': num}
     * @desc target : 해당 타켓
     * @desc default : 화면 로드 시 초기 액티브 index
     */
    click(params) {
        _.setEventState('clickTab', params);

        let firstPass = true; 

        const data = {
            params: _.getEventState('clickTab')
        };

        //탭 클릭시 타겟 show
        PT_STATE.$PROJECT.off('click.clickTab').on('click.clickTab', '[data-role-tab] > a', function (e) {
            e.preventDefault();
            const $this = $(this);
            
            if($this.hasClass('active')) return;
            const $parent = $this.closest('[data-role-tab]');
            const $tabTarget = `[data-role-tab="${$parent.attr('data-role-tab')}"]`;
            const { target } = _.findItem(data.params, 'el', $tabTarget);
            const _idx = $this.attr('data-tab-idx');
            const tabMenuHeight = $('.pt_benefit__tabmenu').outerHeight();
            
            // a11y - 선택 표시만 남기고 포커스 관련 코드 제거
            $parent.find('.selected_option').remove();
            $this.addClass('active').siblings().removeClass('active');
            $this.append('<span class="blind selected_option">선택됨</span>');
            
            // 포커스 및 스크롤 이동 코드 제거
            // 앵커 이동만 유지 (포커스 없이)
            if(firstPass === false) {
                data.params.forEach(function(item, index){
                    if(item.el === $tabTarget && item.anc === true){
                        // 앵커이동 - 포커스 없이 스크롤만 이동
                        $('html, body').stop().animate({
                            scrollTop: $(target).offset().top + _.pxToVw(-130, -150) - $($tabTarget).outerHeight()
                        }, 500);
                    }
                });
            }
            
            if(_idx === 'all'){
                $(target).each((idx, item) => {
                    $(item).children().show();
                })
                return;
            }
            
            $(target).each((idx, item) => {
                $(item).children().eq(_idx).show().siblings().hide();
            })

        });

        //초기값 제외 hide 처리
        Object.values(data.params).forEach((item, idx) => {
            const { el, default: _index = 0 } = item;

            $(el).children().eq(_index).trigger('click');

            if(idx === Object.values(data.params).length-1){
                firstPass = false;
            }
        });
    },
};

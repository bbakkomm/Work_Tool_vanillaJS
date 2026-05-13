import { PT_STATE, util as _} from './bs_common';

const $window = $(window);

export const anchor = {
    /**
     * 버튼 클릭 시 페이지 내 data-target으로 앵커 이동
     * @param {object} params {'target': str, 'speed': num, 'scroll': [pc,mo]}
     * @desc target : 해당 타켓
     * @desc speed : 이동 속도
     * @desc scroll : 이동 후 추가 여백
     * @desc reTime : 이동 후 Lazy 컨텐츠 콜백 시간
     * @desc reTimeSpeed : 이동 후 Lazy 컨텐츠 콜백 시간, 재이동 시간
     * @desc click : 클릭 요소 추가
     */
    click(params) {
        _.setEventState('clickAnc', params);

        const data = {
            opt: {
                speed: 500,
                scroll: [0, 0, 0],
            },
            params: _.getEventState('clickAnc')
        };

        PT_STATE.$PROJECT.off('click.clickAnc').on('click.clickAnc', '[data-role-anchor]', function (e) {
            e.preventDefault();
            const $this = $(this);
            const paramitem = _.findItem(data.params, 'el', `[data-role-anchor="${$this.attr('data-role-anchor')}"]`)
            const { target, speed = data.opt.speed, scroll = data.opt.scroll, click } = paramitem;
            const reTime = 500;
            const reTimeSpeed = 100;

            $(target).attr('tabindex', 0);
            $('html, body').stop().animate(
                { 
                    scrollTop: $(target).offset().top + _.pxToVw(scroll[0], scroll[1], scroll[2]) 
                }, 
                { 
                    duration: speed, 
                    step: (now, fx) => {
                        let realPos = $(target).offset().top + _.pxToVw(scroll[0], scroll[1], scroll[2]);
                        if (fx.end !== realPos) {
                            fx.end = realPos;
                        }
                    }
                },
                function(){
                    $(target).focusout(function(){
                        $(target).removeAttr('tabindex');
                    });
                }
            ).promise().done(function() {
                setTimeout(function () {
                    $('html, body').stop().animate(
                        { 
                            scrollTop: $(target).offset().top + _.pxToVw(scroll[0], scroll[1], scroll[2])
                        }, 
                        {
                            duration: reTimeSpeed, 
                            step: (now, fx) => {
                                let realPos = $(target).offset().top + _.pxToVw(scroll[0], scroll[1], scroll[2]);
                                if (fx.end !== realPos) {
                                    fx.end = realPos;
                                }
                            }
                        },
                        function(){
                            $(target).focusout(function(){
                                $(target).removeAttr('tabindex');
                            });
                        }
                    )
                    // 클릭 요소 추가
                    if(click){
                        $(click).trigger('click')
                    }
                }, reTime);
            });

            $(target).focus();
        });
    },

    /**
     * 화면 로드 후 paramsData.target으로 앵커드 이동
     * @param {object} params target:해당 타겟, speed: 속도, scroll: 추가 여백
     * @desc key : 기본 anc key값 변경 필요시 사용
     * @desc target : 해당 타켓
     * @desc speed : 이동 속도
     * @desc scroll : 이동 후 추가 여백
     * @desc reTime : 이동 후 Lazy 컨텐츠 콜백 시간
     * @desc reTimeSpeed : 이동 후 Lazy 컨텐츠 콜백 시간, 재이동 시간
     */
    load(params) {
        _.setEventState('loadAnc', params);

        const data = {
            opt: {
                key: 'anc',
                speed: 500,
                scroll: [0, 0, 0],
            },
            params: _.getEventState('loadAnc')
        };

        const param = _.getParameterByName(data.opt.key);
        const twoDepth = data.params.filter(item => item.url === param)[0]?.twoDepth;

        if (!param) return;

        const reTime = 500;
        const reTimeSpeed = 100;

        $window.off('load.loadAnc').on('load.loadAnc', function () {
            try {
                const { target, speed = data.opt.speed, scroll = data.opt.scroll, click } = _.findItem(data.params, 'url', param);

                $(target).attr('tabindex', 0);
                $('html, body').stop().animate(
                    { 
                        scrollTop: $(target).offset().top + _.pxToVw(scroll[0], scroll[1], scroll[2])
                    }, 
                    {
                        duration: speed, 
                        step: (now, fx) => {
                            let realPos = $(target).offset().top + _.pxToVw(scroll[0], scroll[1], scroll[2]);
                            if (fx.end !== realPos) {
                                fx.end = realPos;
                            }
                        }
                    },
                    function(){
                        $(target).focusout(function(){
                            $(target).removeAttr('tabindex');
                        });
                    }
                ).promise().done(function() {
                    setTimeout(function () {
                        $('html, body').stop().animate(
                            { 
                                scrollTop: $(target).offset().top + _.pxToVw(scroll[0], scroll[1], scroll[2])
                            }, 
                            {
                                duration: reTimeSpeed, 
                                step: (now, fx) => {
                                    let realPos = $(target).offset().top + _.pxToVw(scroll[0], scroll[1], scroll[2]);
                                    if (fx.end !== realPos) {
                                        fx.end = realPos;
                                    }
                                }
                            },
                            function(){
                                $(target).focusout(function(){
                                    $(target).removeAttr('tabindex');
                                });
                            }
                        ).promise().done(ancAfterClick()).done(ancAfter2depthClick());
                    }, reTime);
                });
                $(target).focus();

                function getOneDepthName(param){
                    let result = param.split("_").slice(0, 2).join("_")

                    return result
                }
                
                function ancAfterClick() {
                    // 할인 특가전 탭 url anchor
                    // if (param === 'special_cashback') $('.special_cashback_btn').trigger('click');

                    // AI 올인원 2.0 url anchor
                    if (param === 'subs_tv') $('.btn_menu--tv').trigger('click');
                    if (param === 'subs_refri') $('.btn_menu--refri').trigger('click');
                    if (param === 'subs_kimchi-water') $('.btn_menu--kimchi-water').trigger('click');
                    if (param === 'subs_washer-dryer') $('.btn_menu--washer').trigger('click');
                    if (param === 'subs_aircon') $('.btn_menu--aircon').trigger('click');
                    if (param === 'subs_air-cleaner') $('.btn_menu--airpuri').trigger('click');
                    if (param === 'subs_induction-qooker') $('.btn_menu--cooking').trigger('click');
                    if (param === 'subs_dish-washer') $('.btn_menu--dishwasher').trigger('click');
                    if (param === 'subs_vacuum') $('.btn_menu--vacuum').trigger('click');
                    if (param === 'subs_monitor') $('.btn_menu--monitor').trigger('click');
                    if (param === 'subs_galaxy-book') $('.btn_menu--pc').trigger('click');
                    if (param === 'subs_galaxy-tab') $('.btn_menu--tablet').trigger('click');

                    // 상담서비스 영역
                    if (param === 'counsel-waterpurifier') $('.pt_counsel__tab--01').trigger('click');
                    if (param === 'counsel-refrigerator') $('.pt_counsel__tab--02').trigger('click');
                    if (param === 'counsel-washer') $('.pt_counsel__tab--03').trigger('click');
                    if (param === 'counsel-movingstyle') $('.pt_counsel__tab--04').trigger('click');

                    // 상담서비스 영역
                    if (param === '150000pt') $('[data-tool-dept-nm="triple_dept0"]').trigger('click');
                    if (param === '90000pt')  $('[data-tool-dept-nm="triple_dept1"]').trigger('click');
                    

                    // 투뎁스 바잉툴 (원뎁스 클릭)
                    if (getOneDepthName(param) === 'special_0won') $('[data-tool-dept-nm="dept0"]').trigger('click');
                    if (getOneDepthName(param) === 'special_1won') $('[data-tool-dept-nm="dept1"]').trigger('click');
                    if (getOneDepthName(param) === 'special_10000won') $('[data-tool-dept-nm="dept2"]').trigger('click');
                    if (getOneDepthName(param) === 'special_20000won') $('[data-tool-dept-nm="dept3"]').trigger('click');
                    if (getOneDepthName(param) === 'special_30000won') $('[data-tool-dept-nm="dept4"]').trigger('click');
                    if (getOneDepthName(param) === 'special_40000won') $('[data-tool-dept-nm="dept5"]').trigger('click');
                    
                }

                // 컴포넌트 2뎁스 트리거 함수
                function twoDepthTrigger(container, text){
                    $(container).find('.text').map((idx, item) => {
                        let textValue = $(item).text().trim();
                        let button = $(item).closest('button');

                        if(textValue === text) $(button).trigger('click');
                    });
                }

                function ancAfter2depthClick() {

                    // 바잉툴 2뎁스 트리거
                    if (twoDepth === '[data-tool-cat-nm="cat0_0"]') $('[data-tool-cat-nm="cat0_0"]').trigger('click');

                }
            } catch (err) {
                console.log('해당하는 앵커 영역이 없습니다.');
            }
        });
    },
};

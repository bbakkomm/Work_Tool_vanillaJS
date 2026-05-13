import { PT_STATE, util as _} from './bs_common';

export const benefitSwiper = {
    init(){
        const contsSwiper1 = this.swiper_conts('bnf01');
        const contsSwiper2 = this.swiper_conts('bnf02');
        const contsSwiper3 = this.swiper_conts('bnf03');
        const navSwiper1 = this.swiper_nav('bnf01');
        const navSwiper2 = this.swiper_nav('bnf02');
        const navSwiper3 = this.swiper_nav('bnf03');
        this.var.swiperIns1 = { contsSwiper1, navSwiper1 }
        this.var.swiperIns2 = { contsSwiper2, navSwiper2 }
        this.var.swiperIns3 = { contsSwiper3, navSwiper3 }
    },
    var: {
        swiperIns1: null,
        swiperIns2: null,
        swiperIns3: null,
    },
    swiper_nav(bnfNum) {
        let _this = this;
        return new Swiper(".pt_benefit__nav--"+bnfNum, {
            slidesPerView: "auto",
            observer: true, // 팝업 등 숨겨져있는 상태에서 옵저버 
            observeParents: true, // 팝업 등 숨겨져있는 상태에서 옵저버 
            preloadImages: false,
            lazy: true,
            allowTouchMove: true,
            on: {
                slideChange: function() {}, // 슬라이드 변경 (오토는 불가)
                transitionEnd: function() {},  // 변경 후 (오토 가능)
                transitionStart: function() {},
                click: function() {
                    _this.contsMove(bnfNum, this.clickedIndex);
                },
                breakpoint: function() {  // 브렉포인트 지나갈때마다
                    let that = this;
                    setTimeout(function() {
                        that.slideTo(0, 0);
                    }, 150);
                },
            },
            breakpoints: {
                768: { // 768 이상
                    allowTouchMove: false,
                }
            },
        });
    },
    swiper_conts(bnfNum) {
        let _this = this;
            return new Swiper(".pt_benefit__conts--"+bnfNum, {
                slidesPerView: "auto",
                observer: true, // 팝업 등 숨겨져있는 상태에서 옵저버
                observeParents: true, // 팝업 등 숨겨져있는 상태에서 옵저버
                preloadImages: false,
                lazy: true,
                // freeMode: true,
                allowTouchMove: true,
                pagination: {
                    el: ".pt_benefit__conts--"+bnfNum+" .swiper-pagination",
                    clickable: true,
                },
                on: {
                    slideChange: function() {
                    },
                    transitionEnd: function() {
                    },
                    transitionStart: function() {
                        let $bnfNavList = $('.pt_benefit__nav--'+bnfNum+' .swiper-slide');
                        let $bnfActive = $('.pt_benefit__conts--'+bnfNum+' .swiper-pagination .swiper-pagination-bullet-active').index();

                        $bnfNavList.eq($bnfActive).addClass('on').siblings().removeClass('on');
                        _this.navMove(bnfNum ,this.activeIndex);

                        $bnfNavList.eq($bnfActive).focus();
                    },
                    breakpoint: function() {  // 브렉포인트 지나갈때마다
                        let that = this;
                        setTimeout(function() {
                            that.slideTo(0, 0);
                        }, 150);
                    },
                    init: function() {
                        console.log('Swiper initialized with', this.slides.length, 'slides');
                    },
                },
                navigation: {
                    prevEl: $('.pt_benefit__conts--' + bnfNum).find('.swiper-button-benefit-prev'),
                    nextEl: $('.pt_benefit__conts--' + bnfNum).find('.swiper-button-benefit-next'),
                },
                // autoplay: { // 오토플레이 모바일에서만 작동되게 하려면
                //     enabled: false,
                // },
                breakpoints: {
                    768: {
                        // PC 환경(768px 이상)에서 첫 번째 슬라이드(bnf01)만 스와이퍼 비활성화
                        // allowTouchMove: bnfNum !== 'bnf01',
                        allowTouchMove: true,
                    }
                },
            });
    },

    navMove(bnfNum, idx) {
        if(bnfNum === 'bnf01'){
            this.var.swiperIns1.navSwiper1.slideTo(idx)
        }
        if(bnfNum === 'bnf02'){
            this.var.swiperIns2.navSwiper2.slideTo(idx)
        }
        if(bnfNum === 'bnf03'){
            this.var.swiperIns3.navSwiper3.slideTo(idx)
        }
    },

    contsMove(bnfNum, idx) {
        if(bnfNum === 'bnf01'){
            this.var.swiperIns1.contsSwiper1.slideTo(idx)
        }
        if(bnfNum === 'bnf02'){
            this.var.swiperIns2.contsSwiper2.slideTo(idx)
        }
        if(bnfNum === 'bnf03'){
            this.var.swiperIns3.contsSwiper3.slideTo(idx)
        }
    },

    tp() {
        console.log('tp', this);
        return 11
    },
}

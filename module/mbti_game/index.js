import Material from "./material";

const $container = document.querySelector('.dp_container');
const $commonBtns = document.querySelectorAll('[dp-test-target]');
const [$commonBtns_start, $commonBtns_prev, $commonBtns_reset, $commonBtns_exit] = [
    document.querySelector('[dp-test-target="start"]'), // 시작 버튼
    document.querySelector('[dp-test-target="prev"]'), // 이전 버튼
    document.querySelector('[dp-test-target="reset"]'), // 다시 시작 버튼
    document.querySelector('[dp-test-target="exit"]'), // 닫기 버튼
]
const $actionBtns = document.querySelectorAll('[dp-test-item]'); // 질문 창에 설문 ITEM들
const $qrCommon = document.querySelectorAll('[dp-qr-common]'); // 질문 창, 결과 창
const $qrLoading = document.querySelector('[dp-qr-loading]'); // 로딩 창
const [$triggerTargetBtns_Apply, $pt_apply__agree, $triggerBtns_Apply] = [
    document.querySelector('.pt_apply__btn-apply'), // 응모하기 타겟 버튼
    document.querySelector('.pt_apply__agree'), // 응모하기 동의 박스
    document.querySelector('[dp-qr-apply]'), // Modal 내 응모하기 버튼
]
const qrParams = window.location.hostname; // URL HOST
const qutoURL = qrParams.includes('samsung.com') ? // 로컬, BO 분기처리
"//images.samsung.com/kdp/event/sec/2024/0401_oh_my_test/test/" :
"../../is/images/test/";
let startScrollTop = window.scrollY; // 현재 스크롤 위치
let $modalPopup = document.querySelector('#benefit_popup'); // 모달 컨테이너

// Material 클래스 선언
const MTL = new Material(
    $container,
    [
        $commonBtns_start,
        $commonBtns_prev,
        $commonBtns_reset,
        $commonBtns_exit
    ],
    $actionBtns,
    $qrCommon,
    $qrLoading,
    [
        $triggerTargetBtns_Apply,
        $pt_apply__agree,
        $triggerBtns_Apply
    ],
    qrParams,
    qutoURL,
    $modalPopup
);

const clickMaterial = () => {
    // 질문 창에 설문 ITEM 버튼 클릭 Event
    $actionBtns.forEach(v => {
        v.addEventListener('click', () => {
            MTL.getDatePush({
                'num': v.getAttribute('data-number'),
                'total': v.getAttribute('data-total').split(','),
                'score': Number(v.getAttribute('data-score'))
            });
            MTL.TQ.count++;
            MTL.mathSumTotal();
            MTL.htmlRender();
        });
    });

    $commonBtns_start.addEventListener('click', () => {
        // 시작 버튼 클릭 Event
        startScrollTop = window.scrollY;
    });

    $commonBtns_prev.addEventListener('click', () => {
        // 이전 버튼 클릭 Event
        MTL.TQ.count--;
        MTL.htmlRender();
        MTL.getDatePop();
    });

    $commonBtns_reset.addEventListener('click', (e) => {
        // 다시 시작 버튼 Event
        MTL.dataSetInit();
        MTL.htmlRender();
        window.scrollTo(0, startScrollTop);
    });

    $commonBtns_exit.addEventListener('click', () => {
        // 닫기 버튼 Event
        MTL.dataSetAll();
        MTL.htmlRender();
    });

    $triggerBtns_Apply.addEventListener('click', () => {
        // MODAL 내 응모하기 버튼 Event
        $commonBtns_exit.click();
        window.scrollTo(0, $commonBtns_start.offsetTop);
        // $triggerTargetBtns_Apply.click();
        $triggerTargetBtns_Apply.innerHTML = '마케팅 동의하고 이벤트 응모하기';
        $pt_apply__agree.classList.remove('pt_hide');
    });
}

const Marterial_init = () => {
    // Marterial 초기 선언
    MTL.init();
}

window.addEventListener('load', ()=> {
    Marterial_init();
    clickMaterial();
});

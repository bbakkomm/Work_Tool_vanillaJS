import { CatchMind, Question } from "./modules/catch";
import { BS_Common, util as _ } from "./modules/bs_common";
import catchData from "../data/catch_data.json";

const catchMind = new CatchMind('#catchmind', catchData);
let getRandomInt = Math.floor(Math.random() * 3) + 1; // 1 ~ 3 랜덤

const catchUtil = {
    init($el) {
        this.imageRenderInit();

        // 이벤트 적용
        const _$el = $el;
        const catchCommonBtns = _$el.querySelectorAll('[catch-common-role]');
        const questContents = _$el.querySelector('.catchmind_contents--question');
        let offSetX = 0; // $el 내부 마우스 좌표 X
        let offSetY = 0; // $el 내부 마우스 좌표 Y

        questContents.addEventListener('mousemove', (e) => {
            offSetX = e.offsetX; // 좌표 X 갱신
            offSetY = e.offsetY; // 좌표 Y 갱신
        });

        questContents.addEventListener('click', (e) => {
            let targetRole = e.target.getAttribute('catch-role');

            if (targetRole === 'qbtn') {
                let targetDataId = e.target.getAttribute('data-id');
                let targetState = e.target.getAttribute('catch-state');

                if (targetState === 'N') {
                    // 정답 버튼 클릭 시,
                    e.target.setAttribute('catch-state', 'Y'); // 버튼 정답 상태로 변경
                    e.target.classList.add('active'); // 버튼 정답 Style 적용
                    catchMind.stage.score.push(structuredClone(targetDataId)); // 찾은 정답 값 누적
                }
            } else {
                // 정답 아닌 영역 클릭 시,
                this.noneCheck(questContents, offSetX, offSetY); // 틀림 상자 출력
            }

            catchMind.dataCheck();
            catchUtil.show(catchMind.$el);
            catchUtil.caseBtn(catchMind.$el);
        });

        catchCommonBtns.forEach(item => {
            let btn = item.getAttribute('catch-common-role');

            switch (btn) {
                case 'start':
                    // 게임 시작 CTA
                    item.addEventListener('click', () => {
                        catchMind.stage.level = getRandomInt; // 랜덤 값 스테이지로 이동
                        catchMind.btnInfo.maxLevel = getRandomInt; // 랜덤 값 최대 스테이지로 변경
                        catchMind.reset();
                        catchMind.stageUpdate();

                        catchUtil.show(catchMind.$el);
                        console.log(catchMind);
                    });
                    break
                case 'next':
                    // 다음 스테이지 CTA
                    item.addEventListener('click', () => {
                        catchMind.stage.level += 1; // 다음 스테이지 레벨로 이동
                        catchMind.reset();
                        catchMind.stageUpdate();

                        catchUtil.show(catchMind.$el);
                    });
                    break
                case 'prev':
                    // 이전 스테이지 CTA
                    item.addEventListener('click', () => {
                        catchMind.stage.level -= 1; // 이전 스테이지 레벨로 이동
                        catchMind.reset();
                        catchMind.stageUpdate();

                        catchUtil.show(catchMind.$el);
                    });
                    break
                case 'exit':
                    // 게임 닫기 CTA
                    item.addEventListener('click', () => {
                        getRandomInt = Math.floor(Math.random() * 3) + 1; // 1 ~ 3 랜덤
                        catchMind.stage.level = 0; // 게임 시작 전, 스테이지 레벨 0로 이동
                        catchMind.reset();

                        catchUtil.show(catchMind.$el);

                        // 임시
                        _$el.querySelector('.catchComBtn[catch-common-role="start"]').click();
                    });
                    break
                default:
                    console.error('Catch Common 버튼에 Role이 없습니다.');
            }
        });

        catchUtil.show(_$el);
    },
    show($el) {
        const _$el = $el;
        const _info = catchMind.btnInfo;
        const _stage = catchMind.stage;
        const catchmind_body = _$el.querySelector('.catchmind_body');
        const [
            catchmind_question,
            catchmind_next,
            catchmind_result
        ] = [
            _$el.querySelector('[catch-body-contents="question"]'), // 문제 DIV
            _$el.querySelector('[catch-body-contents="next"]'), // 다음 DIV
            _$el.querySelector('[catch-body-contents="result"]'), // 결과 DIV
        ]

        const [
            catchStartBtn,
            catchNextBtn,
            // catchPrevBtn,
            catchExitBtn
        ] = [
            _$el.querySelector('[catch-common-role="start"]'), // 게임 시작 CTA
            _$el.querySelector('[catch-common-role="next"]'), // 다음 스테이지 CTA
            // _$el.querySelector('[catch-common-role="prev"]'), // 이전 스테이지 CTA
            _$el.querySelector('[catch-common-role="exit"]'), // 게임 닫기 CTA
        ]

        // 문제 DIV
        // 스테이지 레벨 1 이상, 해당 스테이지가 미 클리어 상태
        // if (_stage.level > 0 && _stage.nowState === false) {
        if (_stage.level > 0) {
            catchmind_question.classList.remove('pt_hide');
        } else {
            catchmind_question.classList.add('pt_hide');
        }

        // 결과 DIV
        // 현재 스테이지 레벨과 최대 스테이지 수가 같고 해당 스테이지가 클리어 상태
        const catchDimm = document.querySelector(".pt_catch_dimmed")
        const applyAgree = document.querySelector(".pt_apply__agree")
        const applyBtn = document.querySelector(".pt_apply__btn-apply")
        const linkBtn = document.querySelectorAll(".catchmind_contents__link")

        if (_info.maxLevel === _stage.level && _stage.nowState === true) {
            catchmind_result.classList.remove('pt_hide');
            catchExitBtn.classList.remove('pt_hide');
            catchDimm.classList.remove("pt_hide");
            applyAgree.classList.remove("pt_hide");
            applyBtn.innerHTML = "멤버십 마케팅 동의하고 이벤트 응모하기";

            // 결과창 위치 설정
            let position = _.pxToVw(760, 460);
            window.scroll({top: position});
        } else {
            catchmind_result.classList.add('pt_hide');
            catchExitBtn.classList.add('pt_hide');
            catchDimm.classList.add("pt_hide");
        }

        // 게임 시작 CTA
        // 스테이지 레벨 0
        if (_stage.level === 0) {
            catchStartBtn.classList.remove('pt_hide');
            linkBtn.forEach((el => el.classList.add("pt_hide")))

            catchmind_body.setAttribute('catch-dim', 'Y');
            catchmind_body.setAttribute('catch-stage', getRandomInt);
        } else {
            catchStartBtn.classList.add('pt_hide');
            linkBtn.forEach((el => el.classList.remove("pt_hide")))

            catchmind_body.setAttribute('catch-dim', 'N');
        }

        // 다음 DIV, 다음 스테이지 CTA
        // 스테이지 레벨 1 이상, 현재 스테이지 레벨과 최대 스테이지 수가 같지 않고 해당 스테이지가 클리어 상태
        if (_stage.level > 0 && _info.maxLevel !== _stage.level && _stage.nowState === true) {
            catchNextBtn.classList.remove('pt_hide');
            catchmind_next.classList.remove('pt_hide');
        } else {
            catchNextBtn.classList.add('pt_hide');
            catchmind_next.classList.add('pt_hide');
        }

        // 이전 스테이지 CTA
        // 스테이지 레벨 2 이상, 해당 스테이지가 미 클리어 상태
        // if (_stage.level > 1 && _stage.nowState === false) {
        //     catchPrevBtn.classList.remove('pt_hide');
        // } else {
        //     catchPrevBtn.classList.add('pt_hide');
        // }

        // 게임 닫기 CTA
        // 스테이지 레벨 1 이상
        // if (_stage.level > 0) {
        //     catchExitBtn.classList.remove('pt_hide');
        // } else {
        //     catchExitBtn.classList.add('pt_hide');
        // }
    },
    noneCheck($el, offsetX, offsetY) {
        // $el 내부 틀림 상자 생성
        let noneChk = document.createElement('div');
        noneChk.classList.add('none_chk');
        // noneChk.innerHTML = 'X';
        noneChk.style.left = offsetX + 'px';
        noneChk.style.top = offsetY + 'px';

        $el.appendChild(noneChk);

        setTimeout(() => {
            // 1.5초 후 제거
            noneChk.remove(noneChk.selectedIndex);
        }, 500);
    },
    caseBtn($el) {
        const _$el = $el;

        const [
            catchmind_result,
            pt_catch_dimmed
        ] = [
            _$el.querySelector('[catch-body-contents="result"]'), // 결과 DIV
            document.querySelector('.pt_catch_dimmed'), // 결과 창 Dimmed
        ]
        const [
            resultExitBtn
        ] = [
            _$el.querySelector('[catch-common-role="result_exit"]'), // 결과 창 닫기 CTA
        ]

        resultExitBtn.addEventListener('click', () => {
            catchmind_result.classList.add('pt_hide');
            pt_catch_dimmed.classList.add('pt_hide');
        });
    },
    imageRenderInit() {
        //* 이미지 onLoad Init
        const qrParams = window.location.hostname; // URL HOST
        const qutoURL = qrParams.includes('samsung.com') ? // 로컬, BO 분기처리
        "//images.samsung.com/kdp/event/sec/2024/0501_find_the_corgi_family/catch/" :
        "../../is/images/catch/";

        // let addImage = [
        //     'ftcf_catch_answer_1_01_pc_v1.png',
        //     'ftcf_catch_answer_1_02_pc_v1.png',
        //     'ftcf_catch_answer_1_03_pc_v1.png',
        //     'ftcf_catch_answer_1_04_pc_v1.png',
        //     'ftcf_catch_answer_2_01_pc_v1.png',
        //     'ftcf_catch_answer_2_02_pc_v1.png',
        //     'ftcf_catch_answer_2_03_pc_v1.png',
        //     'ftcf_catch_answer_2_04_pc_v1.png',
        //     'ftcf_catch_answer_3_01_pc_v1.png',
        //     'ftcf_catch_answer_3_02_pc_v1.png',
        //     'ftcf_catch_answer_3_03_pc_v1.png',
        //     'ftcf_catch_answer_3_04_pc_v1.png',
        //     'ftcf_catch_arrow.png',
        //     'ftcf_catch_dim_mo_v1.png',
        //     'ftcf_catch_dim_pc_v1.png',
        //     'ftcf_catch_end_img_mo_v1.png',
        //     'ftcf_catch_end_img_pc_v1.png',
        //     'ftcf_catch_game1_mo_v1.png',
        //     'ftcf_catch_game1_pc_v1.png',
        //     'ftcf_catch_game2_mo_v1.png',
        //     'ftcf_catch_game2_pc_v1.png',
        //     'ftcf_catch_game3_mo_v1.png',
        //     'ftcf_catch_game3_pc_v1.png',
        //     'ftcf_catch_start_img_mo_v1.png',
        //     'ftcf_catch_start_img_pc_v1.png',
        //     'ftcf_catch_start_mo_v1.png',
        //     'ftcf_catch_start_pc_v1.png',
        //     'ftcf_catch_wrong_answer_pc_v1.png',
        // ]

        let addImage = [
            'ftcf_catch_answer_1_01_pc_v2.png',
            'ftcf_catch_answer_1_02_pc_v2.png',
            'ftcf_catch_answer_1_03_pc_v2.png',
            'ftcf_catch_answer_1_04_pc_v2.png',
            'ftcf_catch_answer_2_01_pc_v2.png',
            'ftcf_catch_answer_2_02_pc_v2.png',
            'ftcf_catch_answer_2_03_pc_v2.png',
            'ftcf_catch_answer_2_04_pc_v2.png',
            'ftcf_catch_answer_3_01_pc_v2.png',
            'ftcf_catch_answer_3_02_pc_v2.png',
            'ftcf_catch_answer_3_03_pc_v2.png',
            'ftcf_catch_answer_3_04_pc_v2.png',
            'ftcf_catch_wrong_answer_pc_v1.png',
        ]

        // 이미지 로드
        addImage.forEach(url => {
            try {
                let imageInit = new Image();
                let urlTxt = qutoURL + url;
                imageInit.src = urlTxt;
            } catch (error) {
                console.info(`${error}: 이미지 경로나 이름이 잘못되었습니다.`);
            }
        });
    }
}

window.addEventListener('load', () => {
    catchUtil.init(catchMind.$el);
});

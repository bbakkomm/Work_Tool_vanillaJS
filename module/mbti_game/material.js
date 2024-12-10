import materialData from "./material_test.json";

export default class Material {
    constructor(container, commonBtnsList, actionBtns, qrCommon, qrLoading, qrApplys, qrparams, qutoURL, qrmodalPopup) {
        this.$wrap = document.querySelector('.sec_project_wrap');
        this.$container = container; // 재질 테스트 Container
        this.$commonBtns = commonBtnsList; // 시작, 이전, 다시 시작, 닫기 버튼
        this.$actionBtns = actionBtns; // 질문 창 내 질문 버튼s
        this.$qrCommon = qrCommon; // 질문 창, 결과 창
        this.$question = qrCommon[0]; // 질문 창
        this.$result = qrCommon[1]; // 결과 창
        this.$qrLoading = qrLoading; // 로딩 창
        this.$qrApplys = qrApplys; // 응모하기 타겟 버튼, 응모하기 동의 박스, Modal 내 응모하기 버튼 [.pt_apply__btn-apply, .pt_apply__agree, [dp-qr-apply]]
        this.MaxCount = 10; // 질문 수
        this.LoadingTimer = 3; // 로딩 시간
        this.qrData = materialData; // json Data [query, result]
        this.qrparams = qrparams; // URL HOST
        this.qutoURL = qutoURL; // 로컬, BO 분기처리
        this.omniSec = 'sec:event:material-test:'; // 옴니 전처리
        this.modalPopup = qrmodalPopup; // 모달 Popup

        this.TQ = {
            'count': 0, // 클릭 카운트
            'data': {
                'sum': [], // 클릭 버튼의 속성 Arr (num, total, score)
                'result': [], // 배점 반영된 최대 값을 가진 Type 반영
                'total': {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0}, // 버튼에 반영된 A ~ F 배점 적용
            },
            'prevData' : [], // 모든 설문 완료 시, 이전 'data' 값 누적
        }
    }
    init() {
        this.htmlRender();
        this.imageRenderInit();
        this.materialTool();
    }
    imageRenderInit() {
        //* 이미지 onLoad Init
        let addImage = [
            'omy_test_ico_loading_v1.gif', 'omy_test_question_pc_bg.png', 'omy_test_question_mo_bg.png',
            ...[].concat(...this.qrData.result.map(v => v.item.titimg)) // JSON 내 미리 로드 되어야 할 이미지 목록
        ]

        // 이미지 로드
        addImage.forEach(url => {
            try {
                let imageInit = new Image();
                let urlTxt = this.qutoURL + url;
                imageInit.src = urlTxt;
            } catch (error) {
                console.info(`${error}: 이미지 경로나 이름이 잘못되었습니다.`);
            }
        });
    }
    materialTool() {
        // 로딩 중... 기능
        let dots = window.setInterval(() => {
            let loadingTxt = this.$qrLoading.querySelector(".re-loading-txt");
            let loadingDot = loadingTxt.querySelector(".dot");
            loadingDot.innerHTML.length > 2 ? loadingDot.innerHTML = "" : loadingDot.innerHTML += ".";
        }, 300);
    }
    htmlRender() {
        // HTML - Show, Hide 분기 처리
        if (this.TQ.count < this.MaxCount) {
            // count 0 ~ 9 : 질문 창 노출
            // 질문 창 버튼 노출
            this.$qrCommon.forEach(ele => {
                let attr = ele.getAttribute('dp-qr-common');
                if (attr === 'question') {
                    ele.classList.remove('pt_hide');
                } else {
                    ele.classList.add('pt_hide');
                }
            });

            // 다시 시작 버튼 미노출
            this.$commonBtns[2].classList.add('pt_hide');
        } else {
            // count 10 : 결과 창 노출
            this.$qrCommon.forEach(ele => {
                let attr = ele.getAttribute('dp-qr-common');
                if (attr !== 'question') {
                    // 로딩 창 노출
                    this.$qrLoading.classList.remove('pt_hide');

                    setTimeout(() => {
                        // 로딩 창 미노출
                        this.$qrLoading.classList.add('pt_hide');

                        if (getComputedStyle(this.modalPopup).display !== 'none') {
                            // 로딩 중 모달 창 On 상태
                            ele.classList.remove('pt_hide');
                            this.$commonBtns[2].classList.remove('pt_hide');
                        } else {
                            // 로딩 중 모달 창 Off 상태
                            ele.classList.add('pt_hide');
                            this.$commonBtns[2].classList.add('pt_hide');
                        }

                        // 다시 시작 버튼 노출
                    }, this.LoadingTimer * 1000);
                } else {
                    ele.classList.add('pt_hide');
                }
            });

            // 응모하기 동의 박스 노출
            this.$qrApplys[1].classList.remove('pt_hide');
        }

        if (0 < this.TQ.count && this.TQ.count < this.MaxCount) {
            // count 1 ~ 9 : 이전 버튼 노출
            this.$commonBtns[1].classList.remove('pt_hide');
        } else {
            // count 0, 10 : 이전 버튼 미노출
            this.$commonBtns[1].classList.add('pt_hide');
        }

        this.dataRender();
    }
    dataRender() {
        // HTML 내 속성 및 텍스트 적용
        const dataQuestion = this.qrData.query; // json Data [query]
        const dataResult = this.qrData.result; // json Data [result]

        if (this.TQ.count < this.MaxCount) {
            // count 0 ~ 9 : 질문 창 내 데이터 반영
            this.$question.querySelector('.qa-gauge_line').style.width = `${Number(dataQuestion[this.TQ.count].id * 10)}%`; // 게이지
            this.$question.querySelector('.qa-gauge_num').innerHTML = `${dataQuestion[this.TQ.count].id}/${this.MaxCount}`; // 상단 번호
            this.$question.querySelector('.qa-title_num').innerHTML = `<span class="en">Q<span>${dataQuestion[this.TQ.count].id}.`; // 페이지 번호
            this.$question.querySelector('.qa-title_txt').innerHTML = dataQuestion[this.TQ.count].title; // 페이지 타이틀
            this.$commonBtns[3].setAttribute('data-omni', this.omniSec + dataQuestion[this.TQ.count].combtns.exit); // 질문 창 닫기 버튼 omni

            // 질문 창 내 버튼 속성 적용
            this.$actionBtns.forEach((ele, i) => {
                ele.setAttribute('data-number', dataQuestion[this.TQ.count].item[i].number); // 버튼 번호
                ele.setAttribute('data-total', dataQuestion[this.TQ.count].item[i].total); // 점수 반영되어야 할 타입
                ele.setAttribute('data-score', dataQuestion[this.TQ.count].item[i].score); // 반영 되어야할 점수
                ele.setAttribute('data-omni', this.omniSec + dataQuestion[this.TQ.count].item[i].omni); // 질문 버튼 omni
                ele.innerHTML = dataQuestion[this.TQ.count].item[i].question; // 버튼 내 질문 문자열 반영
                ele.classList.remove('active'); // active 초기화
                ele.blur(); // 포커스 초기화
            });
        } else {
            // count 10 : 결과 창 내 데이터 반영
            const rowResult = dataResult.filter(v => v.type === this.TQ.data.result[0])[0]; // 누적된 데이터와 일치하는 결과 데이터 필터

            // 결과 창 메인 이미지
            for (let i=0; i<this.$result.querySelector('.result_img').children.length; i++) {
                this.$result.querySelector('.result_img').children[i].setAttribute('src', `${this.qutoURL + rowResult.item.titimg[i]}`);
            }

            this.$result.setAttribute('dp-qr-type', rowResult.type); // 결과 창 타입
            this.$result.querySelector('.dp_re_blind').innerHTML = rowResult.item.blind; // 결과 창 블라인드 텍스트

            this.$result.querySelector('.result_prod__txt').innerHTML = rowResult.product.text; // 상품 텍스트 적용
            this.$result.querySelector('.result_prod__btn').setAttribute('href', rowResult.product.url); // 상품 URL 적용

            this.$qrApplys[0].innerHTML = '마케팅 동의하고 이벤트 응모하기';

            this.$commonBtns[2].setAttribute('data-omni', this.omniSec + rowResult.combtns.btn.reset); // 결과 창 다시하기 버튼 omni
            this.$commonBtns[3].setAttribute('data-omni', this.omniSec + rowResult.combtns.btn.exit); // 결과 창 닫기 버튼 omni
            this.$result.querySelector('.result_prod__btn').setAttribute('data-omni', this.omniSec + rowResult.product.omni); // 상품 Omni
            this.$result.querySelector('.result_link__btn.share').setAttribute('data-omni', this.omniSec + rowResult.combtns.sns.share) // 공유하기 Omni
            this.$result.querySelector('.result_link__btn.facebook').setAttribute('data-omni', this.omniSec + rowResult.combtns.sns.facebook) // 페이스북 Omni
            this.$result.querySelector('.result_link__btn.blog').setAttribute('data-omni', this.omniSec + rowResult.combtns.sns.naverblog) // 네이버 블로그 Omni
            this.$result.querySelector('.result_link__btn.kakao').setAttribute('data-omni', this.omniSec + rowResult.combtns.sns.kakao) // 카카오 Omni
            this.$qrApplys[2].setAttribute('data-omni', this.omniSec + rowResult.combtns.btn.apply) // 결과 창 응모하기 버튼 Omni
        }
    }
    getDatePush(btnData) {
        if (this.TQ.count < this.MaxCount) {
            // sum 배열에 데이터 Push
            this.TQ.data.sum.push(btnData);
        }
    }
    getDatePop() {
        if (this.TQ.count < this.MaxCount) {
            // sum 배열에 데이터 Pop
            const popData = this.TQ.data.sum.pop();

            // HtmlRender 후, pop 된 데이터를 이용하여 active 적용
            this.$actionBtns.forEach((ele, i) => {
                if (popData.num === ele.getAttribute('data-number')) {
                    ele.classList.add('active');
                } else {
                    ele.classList.remove('active');
                }
            });
        }
    }
    mathSumTotal() {
        if (this.TQ.count === this.MaxCount) {
            // data sum 배열 내, 질문들의 점수 total에 누적
            this.TQ.data.sum.forEach(v => {
                v.total.forEach(c => this.TQ.data.total[c] += v.score);
            });

            // 누적된 값을 가진 total, 점수 기준으로 내림차순 정렬 후 첫번째 값 result에 푸시
            this.TQ.data.result = Object.entries(this.TQ.data.total).sort((a,b) => b[1]-a[1])[0];

            // 이전 데이터에 푸시
            this.TQ.prevData.push(structuredClone(this.TQ.data));
        }
    }
    dataSetInit() {
        // 현 데이터 초기화, 이전 데이터 제외
        this.TQ.count = 0;
        this.TQ.data.sum.splice(0);
        this.TQ.data.result.splice(0);
        this.TQ.data.total = {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0};
    }
    dataSetAll() {
        // 모든 데이터 초기화
        this.TQ.count = 0;
        this.TQ.data.sum.splice(0);
        this.TQ.data.result.splice(0);
        this.TQ.data.total = {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0};
        this.TQ.prevData.splice(0);
    }
}
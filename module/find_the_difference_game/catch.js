export class CatchMind {
    constructor(obj, catchData) {
        this.$window = window;
        this.el = obj;
        this.$el = document.querySelector(this.el); // catch 컨테이너
        this.data = JSON.parse(JSON.stringify(catchData)); // json 데이터
        this.html = {
            catchHtml: this.$el.children,
            innerHtml: this.$el.innerHTML
        }
        this.btnInfo = {
            maxNum: null, // 각 문제별 정답 버튼 중 최대 개수
            maxLevel: null, // 최대 스테이지 수
            item: null // 문제별 버튼 id 값, pc / mo 위치 값
        };
        this.stage = {
            level: 0, // 해당 스테이지 레벨
            nowState: false, // 해당 스테이지 상태: 정답 모두 찾을 시 true, 정답 모두 못 찾을 시 false
            num: null, // 해당 스테이지 정답 수
            score: [] // 해당 스테이지 정답 찾을 시, id 값 누적
        };

        this.init();
    }
    setData() {
        // 문제 개수 세팅
        this.btnInfo.maxLevel = this.data.question.length;

        // 각 문제별 찾아야하는 정답 개수 세팅
        this.data.question.map(v => Object.assign(v, {'btnlen': v.item.length}));

        // 각 문제별 id 값 세팅
        this.data.question.map((v,i) => v.item.map((c,u) => Object.assign(c, {'id': `${i+1}-${u+1}`})));

        // 각 문제별 정답 개수 중 최대 값 세팅
        this.btnInfo.maxNum = structuredClone(Math.max(...this.data.question.map(v => v.item.length)));

        // 각 문제별 정답 버튼 위치 값 세팅
        this.btnInfo.item = structuredClone(this.data.question.map(v => v.item));
    }
    setHtml() {
        const _$el = this.$el;
        const maxBtn = this.btnInfo.maxNum; // 전체 문제 중 최대 정답 버튼 개수
        const questContents = _$el.querySelector('.catchmind_contents--question'); // 문제 출력 DIV

        questContents.innerHTML = ''; // 초기화

        // 전체 문제 중 최대 정답 버튼 개수 만큼 초기 출력
        for (let i=0; i<maxBtn; i++) {
            questContents.insertAdjacentHTML('beforeend',
                `<button class="catch_question pt_hide" catch-role="qbtn" catch-state="N"></button>`,
            );
        }
    }
    dataCheck() {
        const _stage = this.stage;
        if (_stage.score.length === _stage.num) {
            // 스테이지 클리어 (찾은 정답 수와 찾아야 하는 정답 수가 같을 때)

            if (!_stage.nowState) {
                _stage.nowState = true; // 해당 스테이지 상태 값: true
            }
        } else {
            // 스테이지 미 클리어 (찾은 정답 수와 찾아야 하는 정답 수가 같지 않음)
        }
    }
    stageUpdate() {
        const _stage = this.stage;
        const _$el = this.$el;
        const qBtns = _$el.querySelectorAll('[catch-role="qbtn"]'); // 정답 버튼 Arr

        if (_stage.level > 0) {
            _stage.num = this.data.question[_stage.level-1].btnlen; // 해당 스테이지의 찾아야하는 정답 개수 갱신

            let stageNow = this.data.question[_stage.level-1];
            let stageBtnLen = stageNow.btnlen;

            for (let i=0; i<stageBtnLen; i++) {
                // 해당 스테이지의 각 정답 버튼 속성 및 좌표 갱신
                qBtns[i].setAttribute('data-id', stageNow.item[i].id);
                qBtns[i].classList.remove('pt_hide');
                // qBtns[i].style.left = `${stageNow.item[i].pc.x}px`;
                // qBtns[i].style.top = `${stageNow.item[i].pc.y}px`;
            }
        }
    }
    reset() {
        const _stage = this.stage;
        const _$el = this.$el;
        const qBtns = _$el.querySelectorAll('[catch-role="qbtn"]'); // 정답 버튼 Arr

        _stage.nowState = false; // 해당 레벨 스테이지 클리어 값 초기화
        _stage.score.splice(0); // 해당 레벨 스테이지 찾은 정답 배열 초기화

        qBtns.forEach($ele => {
            // 버튼 속성 초기화
            $ele.setAttribute('catch-state', 'N');
            $ele.setAttribute('data-id', '');
            $ele.classList.add('pt_hide');
            $ele.classList.remove('active');
        });
    }

    init() {
        this.setData();
        this.setHtml();

        console.info(this);
    }
}
/**
 * setDataOption_module v1.0
 * 작성자 : Jacob
 * 작성일 : 2025-09-11
 * 수정일 : 2025-09-11
 */

/**
 * setDataTool
 * - 원시 JSON(syncData.result)을 받아 카테고리/그룹/머지 구조로 가공하는 모듈
 * - 결과(this.mergeData) 구조:
 *   {
 *     [cat]: {
 *       [grp]: {
 *         def:    Object,   // 대표(기본) SKU 한 개 (def === 'O' 인 항목)
 *         active: Object,   // 현재 화면에서 활성화된 SKU (초기값 def와 동일)
 *         items:  Array,    // 그룹에 속한 모든 SKU 목록
 *         config: {         // 그룹별 UI/동작 설정
 *           strictChain: Boolean // (기본 true) 상위 미선택 시 하위 숨김 여부
 *         }
 *         // (실행 스크립트에서 setOpt로 unique를 추가: unique.optCdCo/optCdA/optCdB)
 *       }
 *     }
 *   }
 */
export class setDataTool {
    /**
     * @param {string} containerEle  - 루트 컨테이너 셀렉터('#aiBuying')
     * @param {string} categoryEle   - 카테고리 영역 셀렉터('#pt_ai_category')
     * @param {string} contentsEle   - 컨텐츠 영역 셀렉터('#pt_ai_contents')
     * @param {Object} syncData      - 원본 데이터(JSON). 형태: { result: [...] }
     */
    constructor(containerEle, categoryEle, contentsEle, syncData) {
        // 원본 JSON 깊은복사 (가공 도중 원본 변형 방지)
        this.lawData = JSON.parse(JSON.stringify(syncData.result));

        // DOM 캐시
        this.$window = window;
        this.el = containerEle;
        this.$el         = $(this.el);                           // 메인 컨테이너
        this.$CateGoryEl = $(`${containerEle} ${categoryEle}`);  // 카테고리 영역
        this.$ContentsEl = $(`${containerEle} ${contentsEle}`);  // 컨텐츠 영역

        // 가공 후 보관될 데이터 컨테이너
        this.categoryData = {}; // 카테고리별 분류 { cat: [...] }
        this.groupData = {};    // 그룹별 분류 { grp: [...] }
        this.mergeData = {};    // 최종 머지 데이터 (UI가 주로 참조)

        this.init();
    }

    /**
     * 원시 데이터를 카테고리/그룹으로 분류하고, mergeData 형태로 재구성
     */
    setData() {
        let setMergeData = {};
        let catDivision = {};
        let grpDivision = {};
        
        // 1) 카테고리/그룹 단위로 1차 분류 (조회/디버깅/확장에 유용)
        this.lawData.forEach(item => {
            // 카테고리별 배열 쌓기
            !catDivision[item.cat]
                ? (catDivision[item.cat] = [{ ...item }])
                : catDivision[item.cat].push({ ...item });

            // 그룹별 배열 쌓기
            !grpDivision[item.grp]
                ? (grpDivision[item.grp] = [{ ...item }])
                : grpDivision[item.grp].push({ ...item });
        });

        // 2) mergeData 구성: cat → grp → { def, active, items, config }
        setMergeData = this.lawData.reduce((acc, item) => {
            const cat = item.cat;
            const grp = item.grp;
            const hasDef = item.def !== '-' ? item.def : null; // 'O'면 대표, '-'면 없음

            // cat/grp 노드 보장
            if (!acc[cat]) acc[cat] = {};
            if (!acc[cat][grp]) {
                acc[cat][grp] = {
                    def: {},       // 대표 SKU (있을 경우 아래에서 세팅)
                    active: {},    // 활성 SKU (초기 def와 동일)
                    items: [],     // 그룹의 모든 SKU
                    config: {}     // 그룹별 동작 설정 (아래에서 기본값 세팅)
                };
            }

            // 대표/활성 SKU 설정 (def === 'O' 인 항목을 대표로)
            if (hasDef !== null) {
                acc[cat][grp].def = { ...item };
                acc[cat][grp].active = { ...item };
            }

            // 그룹별 config 기본값 (필요 시 실행 코드에서 변경 가능)
            acc[cat][grp].config.strictChain = true;

            // 그룹 아이템 누적
            acc[cat][grp].items.push({ ...item });

            return acc;
        }, {});

        // 보조 분류 및 최종 머지 데이터 바인딩
        this.categoryData = { ...catDivision };
        this.groupData = { ...grpDivision };
        this.mergeData = { ...setMergeData };
    }

    /**
     * 데이터 유효성 점검 훅 (필요 시 확장)
     * - 예: 대표(def) 미지정 그룹 경고, 필수 필드 누락 체크 등
     */
    dataCheck() {
        // TODO: 필요 시 검증 로직 추가
    }

    /**
     * 초기화: 가공 → 검증
     */
    init() {
        this.setData();
        this.dataCheck();
    }
}

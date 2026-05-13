# Work Tool — Vanilla JS

사내 제작 모듈 및 업무 도구 모음. 마이크로사이트 개발, 바잉툴 데이터 관리, 엑셀 데이터 변환 등 실무에서 반복 사용되는 기능을 Vanilla JS 기반으로 모듈화한 레포지토리입니다.

---

## 프로젝트 구조

```
Work_Tool_vanillaJS/
├── excel to info/          # 엑셀 시계열 데이터 분석 도구
├── excel to json/          # 엑셀(탭 구분) → JSON 변환 도구
└── module/                 # 공용 모듈 라이브러리
    ├── bs_common.js        # 공용 유틸 & 상태 관리
    ├── common/             # UI 컴포넌트
    ├── buying_tool/        # 바잉툴 옵션 관리
    ├── tradein/            # 바꿔보상 계산기
    ├── tool_checker/       # 바잉툴 구조 검증기
    ├── multi function/     # 다중 조건 변환 유틸
    ├── mbti_game/          # MBTI 게임
    └── find_the_difference_game/  # 숨은그림찾기 게임
```

---

## 개발 환경

```bash
npm install
npm run dev      # 개발 서버 (Vite)
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
```

---

## 모듈 상세

### excel to json

엑셀에서 복사한 탭 구분 텍스트를 바잉툴 JSON 스키마로 변환하는 도구.

**변환 흐름**
```
탭 구분 텍스트 붙여넣기
  → 옵션형 / 그룹형 모드 선택
  → optCd/optNm 짝 파싱
  → 그룹별 default 검증 (그룹당 정확히 1개)
  → JSON 출력 + 복사
```

**변환 모드**

| 모드 | 설명 |
|------|------|
| 옵션형 | 단일 flat 배열 구조 |
| 그룹형 | 카테고리 → 그룹 → 아이템 계층 구조 |

- localStorage로 사용자 설정 보존
- 내장 DataTable 뷰 및 Readme 탭 제공

---

### excel to info

산업용 설비 데이터 시트를 분석하는 도구. 타임스탬프 기반 가동/정지 구간을 파싱해 통계와 차트로 시각화합니다.

**분석 항목**
- FirstTime / LastTime / RunningTime
- 구간별 최소/최대/평균 전류·전력
- Highcharts 기반 시계열 차트 렌더링

---

### module/bs_common.js

전체 모듈이 공유하는 유틸 함수와 전역 상태 저장소.

```javascript
PT_STATE = {
  $PROJECT,        // jQuery 루트 객체
  $PROJECT2,
  eventState: {}   // 이벤트별 config 저장소
}

util = {
  isMobile()               // 화면 폭 기준 모바일 판단
  isFold()                 // 폴더블 기기 판단
  addComma() / removeComma() // 숫자 포맷
  pxToVw(px, type)         // px → vw 변환 (PC: 1440, Mobile: 720, Fold: 802)
  getParameterByName()     // URL 쿼리 파라미터 파싱
  setEventState() / getEventState()  // 이벤트 상태 관리
  findItem()               // 배열 필터링
  alert()                  // 커스텀 alert
}
```

---

### module/common — UI 컴포넌트

| 파일 | 역할 |
|------|------|
| `anchor.js` | 페이지 내 스무스 스크롤 앵커 이동 |
| `tab.js` | 탭 버튼 클릭 → 콘텐츠 show/hide |
| `sticky.js` | 스크롤 추적 스티키 네비게이션 + 활성 섹션 표시 |
| `video.js` | HTML5 video + YouTube embed 반응형 처리 |
| `benefitSwiper.js` | Swiper.js 기반 혜택 섹션 슬라이더 |
| `countDown.js` | 일/시간/분/초 카운트다운 타이머 |
| `sns.js` | 카카오톡·페이스북·네이버·인스타 공유 |
| `preload.js` | 이미지 배열 사전 로드 |

---

### module/buying_tool — 바잉툴 옵션 관리

상품 옵션 데이터를 카테고리 → 그룹 → SKU 계층으로 변환하고, 옵션 선택 체인을 관리하는 핵심 모듈.

**setDataTool.js**

```javascript
new SetDataTool(containerEle, categoryEle, contentsEle, syncData)

// 내부 데이터 구조
mergeData = {
  [category]: {
    [group]: {
      def: 기본값,
      active: 활성 여부,
      items: [...],
      config: {}
    }
  }
}
```

**setDataOption_buying.js**
- 옵션 선택 연동 체인 로직
- 선택 상태 유효성 검증

---

### module/tradein — 바꿔보상 계산기

Samsung Galaxy 기기의 바꿔보상 가격을 조회하는 팝업 모듈.

**동작 흐름**
```
trade.json 로드
  → 구매모델 / 브랜드 / 반납모델 콤보박스 생성
  → 사용자 선택 → 필터링
  → priceA / priceB / priceC 조회 → 테이블 업데이트
```

| 파일 | 설명 |
|------|------|
| `tradein.js` | TradeIn 클래스 (콤보박스 렌더링 + 가격 계산) |
| `trade.json` | 옵션 및 가격 원본 데이터 (179KB) |
| `style.scss` | 팝업 스타일 |

---

### module/tool_checker — 바잉툴 구조 검증기

URL 파라미터 `?check=buying` 진입 시 활성화되는 디버깅 패널.
바잉툴 HTML DOM 구조와 optCheck JSON 스키마의 일치 여부를 검사합니다.

- sessionStorage로 입력값 보존 (새로고침 후 복원)

---

### module/multi function — 다중 조건 변환

데이터 속성에 작성된 조건식을 파싱해 Boolean을 반환하는 유틸 함수.

```javascript
conditionTransfer(_buying, _$this, data)
// 예: "optA==value1 && optB!=value2 || optC==value3"
// &&, || 논리 연산자 지원
```

---

### module/mbti_game — MBTI 게임

마이크로사이트용 MBTI 성격 테스트 인터랙티브 게임.

| 파일 | 설명 |
|------|------|
| `material.js` | Material 클래스 (문제 → 점수 → 결과 매핑) |
| `material_test.json` | 문항 및 결과 데이터 |

---

### module/find_the_difference_game — 숨은그림찾기 게임

마이크로사이트용 숨은그림찾기 인터랙티브 게임.

| 파일 | 설명 |
|------|------|
| `catch.js` | CatchMind 클래스 (정답 판정, 스테이지 관리) |
| `catch_data.json` | 레벨별 정답 좌표 데이터 (PC/모바일 버전) |

---

## 상태 관리 패턴

모든 모듈은 `PT_STATE.eventState`를 공유 저장소로 사용합니다.

```javascript
// 상태 저장
util.setEventState('keyName', { config })

// 상태 조회
const state = util.getEventState('keyName')
```

---

## 반응형 기준

| 디바이스 | 기준 너비 |
|---------|---------|
| PC | 1440px |
| Mobile | 720px |
| Fold | 802px |

`util.pxToVw(px, type)` 함수로 디자인 px 값을 디바이스별 vw로 변환합니다.

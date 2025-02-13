let data = {
    origin: '',
    processData: [],
    finData: [],
    finAmpData: [],
    finKwData: [],
    finTimeData: [],
    RowLen: 0,
    ColumnLen: 0,
    FirstTime: '',
    LastTime: '',
    RunningTime: '',
    WorkTime: '',
    StopTime: '',
    coreKw: [],
    minKw: 0,
    maxKw: 0,
    avgKw: 0,
    coreA: [],
    minA: 0,
    maxA: 0,
    avgA: 0,
    et: '',
    totalArr: [],
    trueValArr: [],
    falseValArr: [],
    remainTime: 10,
}

const comFunc = {
    resetData: () => {
        data = { origin: '', processData: [], finData: [], finAmpData: [], finKwData: [], finTimeData: [], RowLen: 0, ColumnLen: 0, FirstTime: '', LastTime: '', RunningTime: '', WorkTime: '', StopTime: '', coreKw: [], minKw: 0, maxKw: 0, avgKw: 0, coreA: [], minA: 0, maxA: 0, avgA: 0, et: '', totalArr: [], trueValArr: [], falseValArr: [], remainTime: 10,}

        data.origin = area1.value;
        data.processData = data.origin.split('\n');
        data.finData = data.processData.map((v, i) => v.split('\t').map((c, j) => c.trim()));
        data.finData.pop();
        data.finData[data.finData.length-1][1] === 'STOP' ? data.finData.pop() : data.finData;
        
        // 행, 열 길이
        data.RowLen = data.finData.length;
        data.ColumnLen = data.finData[0].length;

        // 시작, 종료, 측정 시간
        FirstTime = data.finData[0][0];
        LastTime = data.finData[data.RowLen-1][0];
        RunningTime = data.finData[data.RowLen-1][1].split(':').map((v,i) => i === 0 ? `${Number(v)}`.padStart(2,'0') : v).join(':');

        // 가동 중 전력
        coreKw = data.finData.map(v => Number(v.filter((c,j) => j === 3)[0])).filter(v => v !== 0);
        minKw = (Math.min.apply(null, coreKw)).toFixed(2);
        maxKw = (Math.max.apply(null, coreKw)).toFixed(2);
        avgKw = (coreKw.reduce((a, c) => a + c) / coreKw.length).toFixed(2);

        // 가동 중 전류
        coreA = data.finData.map(v => Number(v.filter((c,j) => j === 2)[0])).filter(v => v !== 0);
        minA = (Math.min.apply(null, coreA)).toFixed(2);
        maxA = (Math.max.apply(null, coreA)).toFixed(2);
        avgA = (coreA.reduce((a, c) => a + c) / coreA.length).toFixed(2);

        // 전체 Amp 데이터
        data.finAmpData = data.finData.map(v => Number(v.filter((c,j) => j === 2)[0]).toFixed(2));

        // 전체 kW 데이터
        data.finKwData = data.finData.map(v => Number(v.filter((c,j) => j === 3)[0]).toFixed(2));

        // 전체 시간 데이터
        data.finTimeData = data.finData.map(v => secondsToTimeFormat(secondFormat(v.filter((c,j) => j === 1)[0])));

        // 가동 중, 정지 TOTAL 그룹핑
        let tmpObj = {
            first: ['', null, null],
            last: ['', null, null],
            total: [],
            amp: { min: 0, max: 0, avg: 0, tot: []},
            kw: { min: 0, max: 0, avg: 0, tot: []},
            time: '',
        }

        for (let i=0; i<data.finData.length; i++) {
            let [date, etime, am, kw] = [data.finData[i][0], data.finData[i][1], Number(data.finData[i][2]), Number(data.finData[i][3])];

            if (tmpObj.first[0] === '') {
                tmpObj.first[0] = `${date} ${etime}`;
                tmpObj.first[1] = am;
                tmpObj.first[2] = kw !== 0 ? true : false;
            }

            tmpObj.total.push([date, etime, am, kw]);

            if (i !== 0) {
                if (tmpObj.first[2] !== (kw !== 0 ? true : false)) {
                    // 다를 때
                    tmpObj.last[0] = `${data.finData[i-1][0]} ${data.finData[i-1][1]}`;
                    tmpObj.last[1] = Number(data.finData[i-1][2]);
                    tmpObj.last[2] = Number(data.finData[i-1][3]) !== 0 ? true : false;
                    tmpObj.total.pop();
                    
                    let ampT = tmpObj.total.map((v,j) => v[2]);
                    let kwT = tmpObj.total.map((v,j) => v[3]);
                    let first = tmpObj.first[0].split(' ')[2];
                    let last = tmpObj.last[0].split(' ')[2];

                    tmpObj.amp.tot = structuredClone(ampT);
                    tmpObj.kw.tot = structuredClone(kwT);

                    tmpObj.amp.min = (Math.min.apply(null, tmpObj.amp.tot)).toFixed(2);
                    tmpObj.amp.max = (Math.max.apply(null, tmpObj.amp.tot)).toFixed(2);
                    tmpObj.amp.avg = (tmpObj.amp.tot.reduce((a, c) => a + c) / tmpObj.amp.tot.length).toFixed(2);

                    tmpObj.kw.min = (Math.min.apply(null, tmpObj.kw.tot)).toFixed(2);
                    tmpObj.kw.max = (Math.max.apply(null, tmpObj.kw.tot)).toFixed(2);
                    tmpObj.kw.avg = (tmpObj.kw.tot.reduce((a, c) => a + c) / tmpObj.kw.tot.length).toFixed(2);

                    tmpObj.time = secondsToTimeFormat(secondFormat(last) - secondFormat(first) + data.remainTime);

                    tmpObj.first[2] && tmpObj.last[2] ? data.trueValArr.push(tmpObj) : data.falseValArr.push(tmpObj);

                    data.totalArr.push(tmpObj);

                    tmpObj = {
                        first: [`${date} ${etime}`, am, kw !== 0 ? true : false],
                        last: ['', null, null],
                        total: [[date, etime, am, kw]],
                        amp: { min: 0, max: 0, avg: 0, tot: []},
                        kw: { min: 0, max: 0, avg: 0, tot: []},
                        time: '',
                    }
                }

                if (i === data.finData.length-1) {
                    tmpObj.last[0] = `${date} ${etime}`;
                    tmpObj.last[1] = am;
                    tmpObj.last[2] = kw !== 0 ? true : false;

                    let ampT = tmpObj.total.map((v,j) => v[2]);
                    let kwT = tmpObj.total.map((v,j) => v[3]);
                    let first = tmpObj.first[0].split(' ')[2];
                    let last = tmpObj.last[0].split(' ')[2];

                    tmpObj.amp.tot = structuredClone(ampT);
                    tmpObj.kw.tot = structuredClone(kwT);

                    tmpObj.amp.min = (Math.min.apply(null, tmpObj.amp.tot)).toFixed(2);
                    tmpObj.amp.max = (Math.max.apply(null, tmpObj.amp.tot)).toFixed(2);
                    tmpObj.amp.avg = (tmpObj.amp.tot.reduce((a, c) => a + c) / tmpObj.amp.tot.length).toFixed(2);

                    tmpObj.kw.min = (Math.min.apply(null, tmpObj.kw.tot)).toFixed(2);
                    tmpObj.kw.max = (Math.max.apply(null, tmpObj.kw.tot)).toFixed(2);
                    tmpObj.kw.avg = (tmpObj.kw.tot.reduce((a, c) => a + c) / tmpObj.kw.tot.length).toFixed(2);

                    tmpObj.time = secondsToTimeFormat(secondFormat(last) - secondFormat(first) + data.remainTime);

                    tmpObj.first[2] && tmpObj.last[2] ? data.trueValArr.push(tmpObj) : data.falseValArr.push(tmpObj);

                    data.totalArr.push(tmpObj);
                }
            }
        }

        // WorkTime, StopTime
        WorkTime = secondsToTimeFormat(data.trueValArr.map(v => secondFormat(v.time)).reduce((v,c) => v + c));
        StopTime = secondsToTimeFormat(data.falseValArr.map(v => secondFormat(v.time)).reduce((v,c) => v + c));

        // console.log(data.totalArr);
        // console.log(data.trueValArr);
        // console.log(data.falseValArr);
    },
    resetHtml: () => {
        const detDataEls = document.querySelectorAll('.det_data');
        detDataEls.forEach(v => v.innerHTML = '');
    },
    htmlDraw: () => {
        const detDataEl_01 = document.querySelector('.det_data_01');
        const detDataEl_02 = document.querySelector('.det_data_02');
        const detDataEl_03 = document.querySelector('.det_data_03');
        const detDataEl_04 = document.querySelector('.det_data_04');
        const detDataEl_05 = document.querySelector('.det_data_05');
        
        const detDataEl_06 = document.querySelector('.det_data_06');
        const detDataEl_07 = document.querySelector('.det_data_07');
        const detDataEl_08 = document.querySelector('.det_data_08');
        const detDataEl_09 = document.querySelector('.det_data_09');
        const detDataEl_10 = document.querySelector('.det_data_10');
        const detDataEl_11 = document.querySelector('.det_data_11');

        const detDataEl_12 = document.querySelector('.det_data_12');
        const detDataEl_13 = document.querySelector('.det_data_13');
        
        detDataEl_01.innerHTML = FirstTime;
        detDataEl_02.innerHTML = LastTime;
        detDataEl_03.innerHTML = RunningTime;
        detDataEl_04.innerHTML = `${WorkTime}`;
        detDataEl_05.innerHTML = `${StopTime}`;

        detDataEl_06.innerHTML = `${minA}`;
        detDataEl_07.innerHTML = `${maxA}`;
        detDataEl_08.innerHTML = `${avgA}`;
        detDataEl_09.innerHTML = `${minKw}`;
        detDataEl_10.innerHTML = `${maxKw}`;
        detDataEl_11.innerHTML = `${avgKw}`;
        
        // 가동 Html
        data.trueValArr.forEach((v, i) => {
            let firstTime = v.first[0];
            let lastTime = v.last[0];
            let workTime = v.time;
            let amp = v.amp;
            let kw = v.kw;

            detDataEl_12.insertAdjacentHTML('beforeend', 
                `<div class="dbt_wrap">
                    <div class="dbt_item dbt_item__left">
                        <p class="dbt_num">${(i+1).toString().padStart(2, '0')}.</p>
                    </div>
                    <div class="dbt_item dbt_item__right">
                        <p class="dbt_txt"><b>측정 시간::</b> ${firstTime} ~ ${lastTime}</p>
                        <p class="dbt_txt"><b>가동 시간::</b> ${workTime}</p>
                        <p class="dbt_txt"><b>전류 (A)::</b> 최소: ${amp.min} / 최대: ${amp.max} / 평균: ${amp.avg}</p>
                        <p class="dbt_txt"><b>전력 (kW)::</b> 최소: ${kw.min} / 최대: ${kw.max} / 평균: ${kw.avg}</p>
                    </div>
                </div>`
            );
        });

        // 정지 Html
        data.falseValArr.forEach((v, i) => {
            let firstTime = v.first[0];
            let lastTime = v.last[0];
            let workTime = v.time;

            detDataEl_13.insertAdjacentHTML('beforeend', 
                `<div class="dbt_wrap">
                    <div class="dbt_item dbt_item__left">
                        <p class="dbt_num">${(i+1).toString().padStart(2, '0')}.</p>
                    </div>
                    <div class="dbt_item dbt_item__right">
                        <p class="dbt_txt"><b>측정 시간::</b> ${firstTime} ~ ${lastTime}</p>
                        <p class="dbt_txt"><b>가동 시간::</b> ${workTime}</p>
                    </div>
                </div>`
            );
        });
    }
}

function secondsToTimeFormat (duration) {
    // 초를 hh:mm:ss format 으로 변환
    const totalSeconds = parseInt(duration);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = parseInt(totalSeconds) % 60;
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');

    // return hours > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
    return `${hh}:${mm}:${ss}`;
}

function secondFormat (time) {
    const coreTime = `${time}`.split(':').map(v => +v);
    const [HH, MM, SS] = [coreTime[0], coreTime[1], coreTime[2]];

    return (HH * 60 * 60) + (MM * 60) + SS;
}

function makeChart (cData) {
    document.querySelector('#myChart').style.height = '700px';

    Highcharts.chart('myChart', {
        chart: {
            zoomType: 'x'
        },
        scrollbar: {
            enabled: true
        },
        title: {
            text: ''
        },
        xAxis: [{
            tickInterval: 100,
            categories: Array.from({length: cData.finTimeData.length}, (v, i) => cData.finTimeData[i]),
            crosshair: true,
        }],
        series: [
            {
                lineWidth: 5,
                className: "seriesLine_01",
                data: Array.from({length: cData.finAmpData.length}, (v, i) => Number(cData.finAmpData[i])),
                color: '#1144ed'
            },
            {
                lineWidth: 5,
                className: "seriesLine_02",
                data: Array.from({length: cData.finKwData.length}, (v, i) => Number(cData.finKwData[i])),
                color: '#e3661e'
            },
        ],
    });
}

window.addEventListener('load', () => {
    const area1 = document.querySelector('#area1');
    const area2 = document.querySelector('#area2');
    const area3 = document.querySelector('#area3');
    const area4 = document.querySelector('#area4');

    const ttttt_wrap = document.querySelector('.ttttt_wrap');
    const error_wrap = document.querySelector('.error_wrap');
    const copy_wrap = document.querySelector('.copy_wrap');
    const clipboard = document.querySelector('.clipboard');
    const table_container = document.querySelector('.table_container');

    const btb1 = document.querySelector('.btb1');

    btb1.addEventListener('click', () => {
        if (area1.value === '') return false;

        comFunc.resetData();
        comFunc.resetHtml();
        comFunc.htmlDraw();
        makeChart(data);
    });
});
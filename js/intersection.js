const scheduleBlockTemplate = document.getElementById('scheduleBlockTemplate').content;
const INTERVAL = 15;
let scheduleTable = [];
let cnt = 0;
init();

function newBtnDisable(bool) {
    document.getElementById('addScheduleBlock').disabled = bool;
}

function cardChangeCallback() {
    urlsToSVG();
}

function svgToolDisplay(bool) {
    const action = bool ? 'remove':'add';
    document.getElementById('shareButton').classList[action]('d-none');
}

function init() {
    if (window.location.search) {
        addScheduleBlock(window.location);
        document.getElementById('addScheduleBlock').disabled = false;
        const card = document.querySelector('.card');
        card.querySelector('#title').textContent = new URLSearchParams(window.location.search).get('title');
        saveScheduleBlock(card);
    }else addScheduleBlock();
}

function addScheduleBlock(defaultValue = '') {
    // can be beforebegin, afterbegin, beforeend or afterend
    const element = document.getElementById('main');
    const clone = document.importNode(scheduleBlockTemplate, true);
    if (defaultValue) clone.querySelector('#url').value = defaultValue;
    element.insertAdjacentElement('afterend', clone.firstElementChild);
    document.getElementById('addScheduleBlock').disabled = true;
    cnt++;
}

function saveScheduleBlock(schedule) {
    schedule.classList.remove('border-danger');
    schedule.querySelector('#error').classList.add('d-none');
    const url = schedule.querySelector('#url').value;
    if (url==='') return card_error(schedule, '請輸入網址');
    if (!url.match(/^(http|https):\/\/[^ "]+$/)) return card_error(schedule, '網址格式錯誤');
    scheduleBlockDisable(schedule);
    cardChangeCallback();
    const url_display = schedule.querySelector('#url_display');
    url_display.href = window.location.origin + '?' + url.split('?')[1];
    url_display.classList.remove('d-none');
    const scheduleImage = schedule.querySelector('#scheduleImage');
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const title = decodeURIComponent(urlParams.get('title'));
    const cardTitle = schedule.querySelector('#title');
    if(cardTitle.textContent==="別人的時間表")
        cardTitle.textContent = title;
    createSVGElement(dataToTable(codeToData(urlParams.get('data'))), title, scheduleImage);
    scheduleImage.classList.remove('d-none');
}

function scheduleBlockDisable(schedule) {
    schedule.querySelector('#ipt').classList.add('d-none');
    schedule.querySelector('#save').remove();
    schedule.querySelector('#title').contentEditable = false;
    newBtnDisable(false);
}

function urlsToSVG() {
    var table = new Array(7).fill(1).map(() => new Array((24-8)*60/INTERVAL).fill(1));
    const urls = Array.from(document.querySelectorAll('.card')).reverse();
    for (let i = 0; i < urls.length; i++) {
        let url = urls[i].querySelector('#url').value;
        let tmp_table = dataToTable(codeToData(new URLSearchParams(url).get('data')));
        table = tableIntersection(table, tmp_table);
    }
    createSVGElement(table);
}
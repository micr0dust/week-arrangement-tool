const timeSlotTemplate = document.getElementById('timeSlotTemplate').content;
const INTERVAL = 15;
let timeSlotTable = [];
let data = [];
let cnt = 0;
init();

function newBtnDisable(bool) {
    document.getElementById('addTimeSlot').disabled = bool;
}

function cardChangeCallback() {
    saveToData();
}

function svgToolDisplay(bool) {
    const action = bool ? 'remove':'add';
    document.getElementById('shareButton').classList[action]('d-none');
    document.getElementById('editButton').classList[action]('d-none');
}

function init() {
    let counter = 0;
    for (let i = 8 * 60; i < 24 * 60; i += INTERVAL) {
        let hours = Math.floor(i / 60);
        let minutes = i % 60;
        timeSlotTable.push(`${(hours < 10 ? '0' : '') + hours}:${(minutes < 10 ? '0' : '') + minutes}`);
        counter++;
    }
    timeSlotTable.push(`24:00`);
    if (window.location.search) {
        const urlParams = new URLSearchParams(window.location.search);
        const load_data = codeToData(urlParams.get('data'));
        for (let i = 0; i < load_data.length; i++)
            buildFromData(load_data[i]);
        document.getElementById('main_title').textContent = decodeURIComponent(urlParams.get('title'));
        data = load_data;
        newBtnDisable(false);
        cardChangeCallback();
    }
    else addTimeSlot();
}

function addTimeSlot() {
    // can be beforebegin, afterbegin, beforeend or afterend
    const element = document.getElementById('main');
    const clone = document.importNode(timeSlotTemplate, true);
    setTimeOptions(clone, 'startTime');
    setTimeOptions(clone, 'endTime');
    const idlist = ['available','normal', 'weekend', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    for (let i = 0; i < idlist.length; i++) {
        let uniqueId = `${idlist[i]}${cnt}`;
        clone.querySelector(`#${idlist[i]}`).setAttribute('id', uniqueId);
        clone.querySelector(`label[for="${idlist[i]}"]`).setAttribute('for', uniqueId);
    }
    element.insertAdjacentElement('afterend', clone.firstElementChild);
    newBtnDisable(true);
    cnt++;
}

function setTimeOptions(element, selectId, begin=0) {
    let select = element.querySelector(`#${selectId}`);
    const defaultValue = parseInt(select.value);
    select.innerHTML = '';
    let counter = begin;
    for (let i = 8 * 60 + INTERVAL * begin; i < 24 * 60; i += INTERVAL) {
        let hours = Math.floor(i / 60);
        let minutes = i % 60;
        let option = document.createElement('option');
        option.value = counter;
        option.text = `${(hours < 10 ? '0' : '') + hours}:${(minutes < 10 ? '0' : '') + minutes}`;
        select.appendChild(option);
        counter++;
    }
    let option = document.createElement('option');
    option.value = counter;
    option.text = `24:00`;
    select.appendChild(option);
    if(begin && defaultValue >= begin) select.value = defaultValue;
}

function handleTimeChange(element) {
    const startTime = parseInt(element.querySelector(`#startTime`).value);
    setTimeOptions(element, 'endTime', startTime);
}

function saveTimeSlots(timeSlot) {
    timeSlot.classList.remove('border-danger');
    timeSlot.querySelector('#error').classList.add('d-none');
    const startTime = parseInt(timeSlot.querySelector('#startTime').value);
    const endTime = parseInt(timeSlot.querySelector('#endTime').value);
    if (startTime > endTime) return card_error(timeSlot, '開始時間必須早於結束時間');
    if (startTime == endTime) return card_error(timeSlot, '你時間設這樣有什麼意義？');
    const daysElement = timeSlot.querySelector('#days');
    const inputElements = daysElement.querySelectorAll('input');
    let flag = 0;
    for (let i = 0; i < inputElements.length; i++)
        flag |= inputElements[i].checked;
    if (!flag) return card_error(timeSlot, '請選擇欲套用的日期');
    timeSlotDisable(timeSlot);
    cardChangeCallback();
}

function timeSlotDisable(timeSlot) {
    const checkboxes = timeSlot.querySelectorAll('input');
    for (let i = 0; i < checkboxes.length; i++)
        checkboxes[i].disabled = true;
    timeSlot.querySelector('#startTime').disabled = true;
    timeSlot.querySelector('#endTime').disabled = true;
    timeSlot.querySelector('#save').remove();
    timeSlot.querySelector('#title').contentEditable = false;
    newBtnDisable(false);
}

function saveToData() {
    const segments = Array.from(document.querySelectorAll('.card')).reverse();
    let tmp_data = [];
    for (let i = 0; i < segments.length; i++) {
        let days = segments[i].querySelector('#days').querySelectorAll('input');
        let daySelected = 0;
        for (let j = 0; j < days.length; j++)
            daySelected |= days[j].checked << j;
        tmp_data.push({
            title: segments[i].querySelector('#title').textContent,
            startTime: parseInt(segments[i].querySelector('#startTime').value),
            endTime: parseInt(segments[i].querySelector('#endTime').value),
            days: intToBase65(daySelected),
            mode: segments[i].querySelector('[name="available"]').checked? -1:1
        });
    }
    data = tmp_data;
    createSVGElement(dataToTable(data));
    dataToCode();
}

function vaildRow(data){
    let table = new Array((24-8)*60/INTERVAL).fill(0);
    for(let i = 0; i < data.length; i++)
        table[data[i].startTime] = table[data[i].endTime] = 1;
    return table;
}

function checkboxNormal(element) {
    if(element.disabled) return;
    let checkboxes = Array.from(
        element.closest('.card').querySelector('#days').querySelectorAll('input')
    ).slice(0, 5);
    if(element.checked) checkboxes.forEach(checkbox => checkbox.checked = true);
    else checkboxes.forEach(checkbox => checkbox.checked = false);
}

function checkboxWeekend(element) {
    if(element.disabled) return;
    let checkboxes = Array.from(
        element.closest('.card').querySelector('#days').querySelectorAll('input')
    ).slice(5);
    if(element.checked) checkboxes.forEach(checkbox => checkbox.checked = true);
    else checkboxes.forEach(checkbox => checkbox.checked = false);
}

function checkNormal(element) {
    if(element.disabled) return;
    if(!element.checked) element.closest('.card').querySelector('[name="normal"]').checked = false;
}

function checkWeekend(element) {
    if(element.disabled) return;
    if(!element.checked) element.closest('.card').querySelector('[name="weekend"]').checked = false;
}

function availableSwitch(element) {
    if(element.disabled) return;
    const title = element.closest('.card').querySelector('#title');
    if(element.checked && title.textContent === '有空的時段'){
        title.textContent = '沒空的時段';
    }else if(!element.checked && title.textContent === '沒空的時段'){
        title.textContent = '有空的時段';
    }
}

function editTitle() {
    const title = document.querySelector('#main_title');
    Swal.fire({
        title: '修改標題',
        input: 'text',
        inputValue: title.textContent,
        showCancelButton: true,
        confirmButtonText: '確認',
        cancelButtonText: '取消',
        inputValidator: (value) => {
            if (!value) return '標題不能為空';
        }
    }).then((result) => {
        if (result.isConfirmed) {
            title.textContent = result.value;
            cardChangeCallback();
        }
    });
}
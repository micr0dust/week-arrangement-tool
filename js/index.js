const timeSlotTemplate = document.getElementById('timeSlotTemplate').content;
const INTERVAL = 15;
let timeSlotTable = [];
let data = [];
let cnt = 0;
init();

function init() {
    let counter = 0;
    for (let i = 8 * 60; i < 24 * 60; i += INTERVAL) {
        let hours = Math.floor(i / 60);
        let minutes = i % 60;
        timeSlotTable.push(`${(hours < 10 ? '0' : '') + hours}:${(minutes < 10 ? '0' : '') + minutes}`);
        counter++;
    }
    timeSlotTable.push(`24:00`);
    if (window.location.search) codeToData();
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
    document.getElementById('addTimeSlot').disabled = true;
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

function removeTimeSlot(element) {
    element.remove();
    saveToData();
    if(document.getElementById('save') === null)
        document.getElementById('addTimeSlot').disabled = false;
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
    saveToData();
}

function timeSlotDisable(timeSlot) {
    const checkboxes = timeSlot.querySelectorAll('input');
    for (let i = 0; i < checkboxes.length; i++)
        checkboxes[i].disabled = true;
    timeSlot.querySelector('#startTime').disabled = true;
    timeSlot.querySelector('#endTime').disabled = true;
    timeSlot.querySelector('#save').remove();
    timeSlot.querySelector('#title').contentEditable = false;
    document.getElementById('addTimeSlot').disabled = false;
}

function card_error(timeSlot, msg) {
    timeSlot.classList.add('border-danger');
    const error = timeSlot.querySelector('#error');
    error.textContent = msg;
    error.classList.remove('d-none');
}

function moveUp(card) {
    const prevCard = card.previousElementSibling;
    if (prevCard && prevCard.tagName.toLowerCase() == 'div') card.parentNode.insertBefore(card, prevCard);
    saveToData();
}

function moveDown(card) {
    const nextCard = card.nextElementSibling;
    if (nextCard && nextCard.tagName.toLowerCase() == 'div') card.parentNode.insertBefore(nextCard, card);
    saveToData();
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
    createSVGElement(segmentsToTable(data), vaildRow(data));
    dataToCode();
}

function segmentsToTable(data){
    let table = new Array(7).fill(0).map(() => new Array((24-8)*60/15).fill(0));
    for(let i = 0; i < data.length; i++){
        let days = base65ToInt(data[i].days);
        for(let j = 0; j < 7; j++){
            if(days & (1 << j)){
                for(let k = data[i].startTime; k < data[i].endTime; k++)
                    table[j][k] = data[i].mode;
            }
        }
    }
    return table;
}

function vaildRow(data){
    let table = new Array((24-8)*60/15).fill(0);
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

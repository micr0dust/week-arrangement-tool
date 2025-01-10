function dataToCode() {
    let result_code = "";
    const segments = Array.from(document.querySelectorAll('.card')).reverse();
    for (let i = 0; i < segments.length; i++) {
        let days = segments[i].querySelector('#days').querySelectorAll('input');
        let daySelected = 0;
        for (let j = 0; j < days.length; j++)
            daySelected |= days[j].checked << j;
        daySelected |= segments[i].querySelector('[name="available"]').checked << 7;
        let tmp_data = {
            startTime: intToBase65(parseInt(segments[i].querySelector('#startTime').value)),
            endTime: intToBase65(parseInt(segments[i].querySelector('#endTime').value)),
            days: intToBase65(daySelected)
        };
        result_code += "-" + tmp_data.startTime + tmp_data.endTime + tmp_data.days;
    }
    let newUrl = window.location.origin + window.location.pathname + '?' + result_code.slice(1);
    history.replaceState(null, '', newUrl);
}

function codeToData() {
    let code = window.location.search.split("?")[1];
    let segments = code.split("-");
    let segment;
    let load_data = [];
    for (let i = 0; i < segments.length; i++) {
        segment = segments[i];
        if(segment==='') continue;
        let startTime = base65ToInt(segment[0]);
        let endTime = base65ToInt(segment[1]);
        let days = base65ToInt(segment.slice(2));
        let mode = (days & (1 << 7))? -1:1;
        days &= ~(1 << 7);
        load_data.push({
            title: mode === -1? "沒空的時段":"有空的時段",
            startTime: startTime,
            endTime: endTime,
            days: intToBase65(days),
            mode: mode
        });
    }
    for (let i = 0; i < load_data.length; i++)
        buildFromData(load_data[i]);
    data = load_data;
    saveToData();
}

function buildFromData(segment){
    const element = document.getElementById('main');
    const clone = document.importNode(timeSlotTemplate, true);
    setTimeOptions(clone, 'startTime', segment.startTime);
    setTimeOptions(clone, 'endTime', segment.endTime);
    const idlist = ['available','normal', 'weekend', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const days = base65ToInt(segment.days);
    console.log((days >>> 0).toString(2));
    const checkList = [
        segment.mode==-1,
        Boolean((days & (1+2+4+8+16)) == (1+2+4+8+16)),
        Boolean((days & (32+64)) == (32+64)),
        Boolean(days & 1), Boolean(days & 2), Boolean(days & 4), Boolean(days & 8),
        Boolean(days & 16), Boolean(days & 32), Boolean(days & 64)
    ];
    console.log(checkList);
    for (let i = 0; i < idlist.length; i++) {
        let uniqueId = `${idlist[i]}${cnt}`;
        let selector = clone.querySelector(`#${idlist[i]}`);
        selector.setAttribute('id', uniqueId);
        selector.checked = checkList[i];
        clone.querySelector(`label[for="${idlist[i]}"]`).setAttribute('for', uniqueId);
    }
    clone.querySelector('#title').textContent = segment.title;
    timeSlotDisable(clone);
    element.insertAdjacentElement('afterend', clone.firstElementChild);
    document.getElementById('addTimeSlot').disabled = true;
    cnt++;
}
function dataToCode() {
    let result_code = "";
    const title = document.getElementById('main_title').textContent;
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
    let newUrl = `${window.location.origin + window.location.pathname}`;
    if(result_code) newUrl += `?title=${title}&data=${result_code.slice(1)}`;
    history.replaceState(null, '', newUrl);
}

function codeToData(code) {
    let segments = code.split("-");
    let load_data = [];
    for (let i = 0; i < segments.length; i++) {
        if(segments[i]==='') continue;
        load_data.push(segmentToData(segments[i]));
    }
    return load_data;
}

function segmentToData(segment) {
    let days = base65ToInt(segment.slice(2));
    let mode = (days & (1 << 7))? -1:1;
    return {
        title: mode === -1? "沒空的時段":"有空的時段",
        startTime: base65ToInt(segment[0]),
        endTime: base65ToInt(segment[1]),
        days: intToBase65(days & ~(1 << 7)),
        mode: mode
    };
}

function dataToTable(data){
    let table = new Array(7).fill(0).map(() => new Array((24-8)*60/INTERVAL).fill(0));
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

function tableToVaildRow(table) {
    let preCalc = new Array((24-8)*60/INTERVAL).fill(0);
    for (let j = 0; j < table[0].length; j++)
        for (let i = 1; i < table.length; i++)
            preCalc[j] += table[i][j] << i;
    let vaildRows = new Array((24-8)*60/INTERVAL).fill(0);
    vaildRows[0] = Number(preCalc[0]!=0);
    for(let i = 2; i < vaildRows.length; i++){
        vaildRows[i-1] = preCalc[i-1]?
            Number(preCalc[i-1]!=preCalc[i-2]):Number(preCalc[i-1]!=preCalc[i-2]);
    }
    return vaildRows;
}

function tableIntersection(table, new_table) {
    for (let i = 0; i < table.length; i++)
        for (let j = 0; j < table[0].length; j++) 
            table[i][j] &= Number(new_table[i][j]===1);
    return table;
}

function buildFromData(segment){
    const element = document.getElementById('main');
    const clone = document.importNode(timeSlotTemplate, true);
    setTimeOptions(clone, 'startTime', segment.startTime);
    setTimeOptions(clone, 'endTime', segment.endTime);
    const idlist = ['available','normal', 'weekend', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const days = base65ToInt(segment.days);
    const checkList = [
        segment.mode==-1,
        Boolean((days & (1+2+4+8+16)) == (1+2+4+8+16)),
        Boolean((days & (32+64)) == (32+64)),
        Boolean(days & 1), Boolean(days & 2), Boolean(days & 4), Boolean(days & 8),
        Boolean(days & 16), Boolean(days & 32), Boolean(days & 64)
    ];
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
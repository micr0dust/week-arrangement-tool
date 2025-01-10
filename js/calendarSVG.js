function createSVGElement(data, vaildRow) {
    for(let i = 0; i < vaildRow.length; i++){
        if(vaildRow[i] === 1) break;
        if(i === vaildRow.length - 1){
            document.getElementById('calendarImage').classList.add('d-none');
            document.getElementById('copy').classList.add('d-none');
            return;
        }
    }
    document.getElementById('calendarImage').classList.remove('d-none');
    document.getElementById('copy').classList.remove('d-none');
    const svgNS = "http://www.w3.org/2000/svg";
    const days = ["", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];
    const startTime = 8;
    const endTime = 24;
    const interval = 15; // 每15分鐘一單位
    const col_width = 70; // 每一列的寬度
    const row_height = 20; // 每一行的高度

    let svg_height = 50;
    for(let i = 0; i < vaildRow.length; i++){
        if(vaildRow[i] != 0) svg_height += row_height;
    }

    // 創建SVG元素
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', 700);
    svg.setAttribute('height', svg_height);
    svg.setAttribute('xmlns', svgNS);

    // 生成表頭
    days.forEach((day, index) => {
        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', 60 + col_width * index);
        text.setAttribute('y', row_height);
        text.textContent = day;
        svg.appendChild(text);
    });

    // 生成時間欄
    let offset = 0;
    for (let hour = startTime; hour < endTime; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
            const timeText = document.createElementNS(svgNS, 'text');
            const idx = ((hour - startTime) * 4 + minute / interval);
            if(vaildRow[idx] === 0){
                offset++;
                continue;
            }
            timeText.setAttribute('x', 70);
            timeText.setAttribute('y', 35 + (idx-offset) * row_height);
            timeText.textContent = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            svg.appendChild(timeText);

            // 生成每個時間單位的格子
            for (let dayIndex = 1; dayIndex < days.length; dayIndex++) {
                const rect = document.createElementNS(svgNS, 'rect');
                const idx = ((hour - startTime) * 4 + minute / interval);
                rect.setAttribute('x', 50 + col_width * dayIndex);
                rect.setAttribute('y', 30 + (idx-offset) * row_height);
                rect.setAttribute('width', col_width);
                rect.setAttribute('height', row_height);
                rect.setAttribute('stroke', 'gray');
                if(data[dayIndex - 1][idx] === 1){
                    rect.setAttribute('fill', '#00bfff');
                }else if(data[dayIndex - 1][idx] === -1){
                    rect.setAttribute('fill', '#E7E9EB');
                }
                else rect.setAttribute('fill', 'white');
                svg.appendChild(rect);
            }
        }
    }

    // 將SVG轉換為Data URI格式
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    // 將Data URI設置為img標籤的src屬性
    document.getElementById('calendarImage').src = url;
}

function copyImage() {
    const img = document.getElementById('calendarImage');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    canvas.toBlob(blob => {
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]);
        Swal.fire({
            title: "圖片已複製",
            icon: "success",
            showConfirmButton: false,
            timer: 800
        });
    });
}

// function shareButton(){
//     const img = document.getElementById('calendarImage');
//     if (navigator.share) {
//         navigator.share({
//             title: '分享圖片',
//             text: '這是SVG周曆圖片',
//             url: img.src
//         });
//     } else {
//         Swal.fire('您的裝置不支援分享功能');
//     }
// }

function shareButton() {
    const img = document.getElementById('calendarImage');
    if (navigator.share) {
        fetch(img.src)
            .then(response => response.text())
            .then(svgText => {
                const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(svgBlob);
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                const image = new Image();
                image.onload = () => {
                    canvas.width = image.width;
                    canvas.height = image.height;
                    context.drawImage(image, 0, 0);
                    canvas.toBlob(blob => {
                        const pngUrl = URL.createObjectURL(blob);
                        navigator.share({
                            title: '分享圖片',
                            text: '這是SVG周曆圖片',
                            files: [new File([blob], 'calendar.png', { type: 'image/png' })]
                        }).catch(error => {
                            console.error('分享失敗', error);
                        });
                        URL.revokeObjectURL(pngUrl);
                    }, 'image/png');
                    URL.revokeObjectURL(url);
                };
                image.src = url;
            })
            .catch(error => {
                console.error('無法獲取SVG圖片', error);
            });
    } else {
        Swal.fire('您的裝置不支援分享功能');
    }
}
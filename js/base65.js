const customBase65Chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@$*';

function intToCustomBase65(int) {
    if (int < 0 || int >= customBase65Chars.length) throw new RangeError('整數必須在 0 到 65 之間');
    return customBase65Chars[int];
}

function customBase65ToInt(char) {
    const index = customBase65Chars.indexOf(char);
    if (index === -1) throw new Error('無效的字符');
    return index;
}

function intToBase65(int) {
    if (int < 0) throw new RangeError('不得為負數');
    if (int >= 65) return intToBase65(Math.floor(int / 65)) + intToCustomBase65(int % 65);
    return intToCustomBase65(int);
}

function base65ToInt(base65) {
    if (typeof(base65) === 'number') base65 = String(base65);
    if (base65.length === 0) throw new Error('base65 字符串不能為空');
    if (base65.length === 1) return customBase65ToInt(base65);
    return base65ToInt(base65.slice(0, -1)) * 65 + customBase65ToInt(base65.slice(-1));
}

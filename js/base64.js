const customBase64Chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@$';

function intToCustomBase64(int) {
    if (int < 0 || int >= customBase64Chars.length) throw new RangeError('整數必須在 0 到 63 之間');
    return customBase64Chars[int];
}

function customBase64ToInt(char) {
    const index = customBase64Chars.indexOf(char);
    if (index === -1) throw new Error('無效的字符');
    return index;
}

function intToBase64(int) {
    if (int < 0) throw new RangeError('不得為負數');
    if (int >= 64) return intToBase64(Math.floor(int / 64)) + intToCustomBase64(int % 64);
    return intToCustomBase64(int);
}

function base64ToInt(base64) {
    if (base64.length === 0) throw new Error('base64 字符串不能為空');
    if (base64.length === 1) return customBase64ToInt(base64);
    return base64ToInt(base64.slice(0, -1)) * 64 + customBase64ToInt(base64.slice(-1));
}
const pad = (n, len) => String(n).padStart(len, '0');
const uid = () => Math.random().toString(36).slice(2, 10);
const makeCaseId = (famCode, patCode, visitNum) => pad(famCode, 4) + pad(patCode, 4) + pad(visitNum, 2);
const todayISO = () => new Date().toISOString().slice(0, 10);

module.exports = { pad, uid, makeCaseId, todayISO };

// MagicCal — Web logic
let typed = '';
let currentTotal = null; // number or null
let spectatorMode = false;
let targetNumeric = 202602181734; // default target
let targetHuman = '2026年02月18号17点34分';
let plusSeqCount = 0;
let plusSeqTimer = null;

const displayEl = document.getElementById('display');
const targetNumericEl = document.getElementById('targetNumeric');
const targetHumanEl = document.getElementById('targetHuman');
const targetBox = document.getElementById('targetBox');
const hideTargetBtn = document.getElementById('hideTargetBtn');

function updateDisplay(txt) {
    displayEl.textContent = txt;
}
function updateTargetView() {
    targetNumericEl.textContent = String(targetNumeric);
    targetHumanEl.textContent = targetHuman;
}

function onDigit(d) {
    if (spectatorMode) {
        // 观众按键不改变显示，它始终显示补数（目标 - 当前和）
        const base = currentTotal || 0;
        const needed = Math.max(0, targetNumeric - base);
        typed = String(needed);
        updateDisplay(typed);
        return;
    }
    if (typed === '0') typed = d; else typed = typed + d;
    updateDisplay(typed);
}

function onPlus() {
    if (typed !== '') {
        const v = parseInt(typed, 10) || 0;
        currentTotal = (currentTotal || 0) + v;
        typed = '';
        updateDisplay(String(currentTotal));
    }
    spectatorMode = false;
}

function onEquals() {
    if (typed !== '') {
        const v = parseInt(typed, 10) || 0;
        currentTotal = (currentTotal || 0) + v;
        typed = '';
    }
    updateDisplay(String(currentTotal || 0));
    if ((currentTotal || 0) === targetNumeric) {
        flashReveal();
    }
    spectatorMode = false;
}

function onClear() {
    typed = '';
    currentTotal = null;
    spectatorMode = false;
    updateDisplay('0');
}

function onSpectatorMode() {
    const base = currentTotal || 0;
    const needed = Math.max(0, targetNumeric - base);
    typed = String(needed);
    spectatorMode = true;
    updateDisplay(typed);
}

function flashReveal() {
    targetBox.style.boxShadow = '0 0 0 4px rgba(34,197,94,0.25)';
    setTimeout(() => targetBox.style.boxShadow = '', 1200);
    // 不使用弹窗；直接确保 UI 显示目标数字（等号已更新 display）
    updateDisplay(String(targetNumeric));
}

// 设置目标（使用 datetime-local 输入）
const settingsBtn = document.getElementById('settingsBtn');
const modal = document.getElementById('setTargetModal');
const dtInput = document.getElementById('dtInput');
const saveTarget = document.getElementById('saveTarget');
const cancelTarget = document.getElementById('cancelTarget');

settingsBtn.addEventListener('click', () => { modal.classList.remove('hidden'); dtInput.value = ''; dtInput.focus(); });
cancelTarget.addEventListener('click', () => modal.classList.add('hidden'));
saveTarget.addEventListener('click', () => {
    const v = dtInput.value; // e.g. 2026-02-18T17:34
    if (!v) { alert('请选择一个时间'); return; }
    const d = new Date(v);
    const y = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const numeric = Number(`${y}${mm}${dd}${hh}${min}`);
    targetNumeric = numeric;
    targetHuman = `${y}年${mm}月${dd}号${hh}点${min}分`;
    updateTargetView();
    modal.classList.add('hidden');
});

hideTargetBtn.addEventListener('click', () => {
    if (targetBox.style.display === 'none') {
        targetBox.style.display = '';
        hideTargetBtn.textContent = '隐藏目标';
    } else {
        targetBox.style.display = 'none';
        hideTargetBtn.textContent = '显示目标';
    }
});

// wire keys
document.querySelectorAll('.key').forEach(btn => {
    btn.addEventListener('click', () => {
        const k = btn.getAttribute('data-key');
        if (k !== null) {
            // digit resets plus sequence
            plusSeqCount = 0;
            if (plusSeqTimer) { clearTimeout(plusSeqTimer); plusSeqTimer = null; }
            onDigit(k);
            return;
        }
        if (btn.id === 'plus') {
            plusSeqCount++;
            if (plusSeqTimer) { clearTimeout(plusSeqTimer); }
            plusSeqTimer = setTimeout(() => { plusSeqCount = 0; plusSeqTimer = null; }, 1200);
            if (plusSeqCount === 1) {
                onPlus();
            } else if (plusSeqCount === 3) {
                onSpectatorMode();
                plusSeqCount = 0;
                if (plusSeqTimer) { clearTimeout(plusSeqTimer); plusSeqTimer = null; }
            }
            return;
        }
        // other keys reset plus sequence
        plusSeqCount = 0;
        if (plusSeqTimer) { clearTimeout(plusSeqTimer); plusSeqTimer = null; }
        if (btn.id === 'equals') onEquals();
        if (btn.id === 'clear') onClear();
    });
});

// initialize view
updateTargetView();
updateDisplay('0');

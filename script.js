let initialMinutes = 25;
let minutes = 25;
let seconds = 0;
let interval = null;
let sessions = 0;
let totalFocusSeconds = 0;
let running = false;
let currentMode = 'focus';

const STORAGE_KEY = 'focusData';
let storedDate = todayKey();

const timerEl = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const statsEl = document.getElementById('stats');
const sessionLabelEl = document.querySelector('.session-label');

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.date === todayKey()) {
      sessions = data.sessions || 0;
      totalFocusSeconds = data.totalFocusSeconds || 0;
      storedDate = data.date;
    }
  } catch (_) {}
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      date: storedDate,
      sessions,
      totalFocusSeconds,
    }));
  } catch (_) {}
}

function checkDayReset() {
  const today = todayKey();
  if (today !== storedDate) {
    sessions = 0;
    totalFocusSeconds = 0;
    storedDate = today;
    updateStats();
    saveState();
  }
}

function formatTime(m, s) {
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatFocusTotal(total) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

function broadcastState(extra = {}) {
  if (!window.api || !window.api.sendTimerState) return;
  const total = initialMinutes * 60;
  const elapsed = total - (minutes * 60 + seconds);
  const progress = Math.max(0, Math.min(1, elapsed / total));
  window.api.sendTimerState({
    time: formatTime(minutes, seconds),
    progress,
    label: sessionLabelEl.textContent,
    ...extra,
  });
}

function renderTimer() {
  timerEl.textContent = formatTime(minutes, seconds);
  broadcastState();
}

function renderLabel(label) {
  sessionLabelEl.textContent = label;
  document.body.classList.toggle('focus-mode', currentMode === 'focus');
  broadcastState({ label });
}

function updateStats() {
  const sessionText = `${sessions} session${sessions === 1 ? '' : 's'}`;
  statsEl.textContent = `${sessionText} · ${formatFocusTotal(totalFocusSeconds)} focused today`;
}

startBtn.addEventListener('click', () => {
  if (running) {
    clearInterval(interval);
    startBtn.textContent = 'start';
    saveState();
  } else {
    checkDayReset();
    interval = setInterval(tick, 1000);
    startBtn.textContent = 'pause';
  }
  running = !running;
});

function tick() {
  checkDayReset();

  if (seconds === 0 && minutes === 0) {
    clearInterval(interval);
    running = false;
    startBtn.textContent = 'start';
    if (currentMode === 'focus') {
      sessions++;
      updateStats();
    }
    minutes = initialMinutes;
    seconds = 0;
    renderTimer();
    saveState();
    return;
  }

  if (seconds === 0) {
    minutes--;
    seconds = 59;
  } else {
    seconds--;
  }

  if (currentMode === 'focus') {
    totalFocusSeconds++;
    updateStats();
  }

  renderTimer();
}

document.getElementById('resetBtn').addEventListener('click', () => {
  clearInterval(interval);
  running = false;
  minutes = initialMinutes;
  seconds = 0;
  startBtn.textContent = 'start';
  renderTimer();
  saveState();
});

function setMode(mins, label) {
  clearInterval(interval);
  running = false;
  currentMode = label === 'focus' ? 'focus' : 'break';
  initialMinutes = mins;
  minutes = mins;
  seconds = 0;
  startBtn.textContent = 'start';
  renderTimer();
  renderLabel(label);
  saveState();
}

const customInput = document.getElementById('customInput');
document.getElementById('customBtn').addEventListener('click', () => {
  const val = parseInt(customInput.value, 10);
  if (!val || val < 1 || val > 180) return;
  setMode(val, 'focus');
  customInput.value = '';
});
customInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('customBtn').click();
});

loadState();
updateStats();
renderTimer();
document.body.classList.toggle('focus-mode', currentMode === 'focus');

// Passive day-change watcher (catches midnight while idle)
setInterval(checkDayReset, 60000);

// Window controls
document.getElementById('closeBtn').addEventListener('click', () => {
  window.api.closeMain();
});
document.getElementById('minimizeBtn').addEventListener('click', () => {
  window.api.minimizeMain();
});

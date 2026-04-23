const labelEl = document.getElementById('miniLabel');
const timeEl = document.getElementById('miniTime');
const progressEl = document.getElementById('miniProgress');
const closeBtn = document.getElementById('miniClose');
const artEl = document.getElementById('miniArt');

function applyMode(label) {
  const isFocus = typeof label === 'string' && label.toLowerCase().includes('focus');
  artEl.dataset.mode = isFocus ? 'focus' : 'break';
}

applyMode(labelEl.textContent);

window.api.onTimerState(({ label, time, progress }) => {
  if (label !== undefined) {
    labelEl.textContent = label;
    applyMode(label);
  }
  if (time !== undefined) timeEl.textContent = time;
  if (typeof progress === 'number') {
    progressEl.style.width = `${Math.max(0, Math.min(100, progress * 100))}%`;
  }
});

closeBtn.addEventListener('click', () => {
  window.api.closeMini();
});

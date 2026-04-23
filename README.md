# study timer

> a soft lilac pomodoro-style desktop timer with a tiny my melody who studies on a cloud when you focus and naps on it during breaks

runs locally as an electron app, with a draggable always-on-top "now studying" widget so you can see the timer while you work in anything else.

---

## download

**[→ get the latest release](https://github.com/rushammm/study-timer/releases/latest)**

grab `study-timer.exe` from the Assets section and double-click it. no install, no setup, no dependencies.

> windows will show a blue "windows protected your pc" warning the first time you run an unsigned app. click **more info** → **run anyway**. you only need to do this once.

---

## features

### timer
- preset focus durations: **25m**, **30m**, **45m**, **1h**
- presets breaks: **5m**, **15m long**
- custom duration input (1–180 minutes)
- **start / pause / reset** with a pink gradient cta
- live countdown in a white calculator-style display

### my melody companion
- **focus** — awake, studying on a yellow cloud with her notebook + tea
- **break** — curled up asleep on the cloud with her bow
- swaps automatically with the active mode, in both the main card and the widget

### now-studying widget
- spotify-style floating card, always on top of every app
- live syncs with the main timer via ipc
- draggable by its body (native window drag)
- pink pill close button
- **ctrl + shift + m** to toggle visibility anywhere on your system

### stats
- `0 sessions · 0m 0s focused today`
- focus time accrues **live every second** while running, so pausing always shows real progress
- persisted in `localStorage`
- auto-resets at midnight (checked on every tick + every 60s while idle)

### local-only
- zero internet, zero accounts, zero telemetry
- **lexend deca** self-hosted at `assets/fonts/lexend-deca.woff2`
- no cdn requests

---

## keyboard

| shortcut | action |
|----------|--------|
| `ctrl + shift + m` | toggle the floating widget |
| `enter` (in `min` field) | set a custom duration |

---

## build from source

if you want to hack on it or rebuild the exe yourself:

```
git clone https://github.com/rushammm/study-timer.git
cd study-timer
npm install
npm start          # run in dev
npm run dist       # build dist/study-timer.exe (~74mb portable)
```

first `npm install` downloads electron (~100mb, one time).

---

## project layout

```
index.html          main timer card
style.css           main card styles
script.js           timer logic + ipc broadcast

mini-player.html    the floating widget
mini-player.css     widget styles
mini-player.js      ipc listener

main.js             electron entry, spawns both windows
preload.js          contextbridge ipc api

assets/
  fonts/            lexend deca (woff2)
  melody.png        awake melody (focus)
  melody-sleep.png  sleeping melody (break)
  icon.png          app + favicon
  ...               source art
```

---

## how it works

- **two browser windows** — a frameless transparent main window and a frameless always-on-top mini window
- **shared preload** — `preload.js` exposes a small `window.api` over `contextBridge`: `sendTimerState`, `onTimerState`, `closeMini`, `closeMain`, `minimizeMain`
- **ipc** — the main renderer broadcasts `{ time, progress, label }` on every tick; the main process relays to the mini window, which re-renders in place
- **state** — `focusData` in `localStorage` holds `{ date, sessions, totalFocusSeconds }`; the date roll-over check zeroes it at midnight

---

## credits

character art: my melody © sanrio. font: [lexend deca](https://fonts.google.com/specimen/Lexend+Deca) (ofl). built with [electron](https://www.electronjs.org/).

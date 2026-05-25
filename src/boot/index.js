/*
 * Boot screen — session-first animated splash for Compass.
 * Phases: 1) terminal dmesg+systemd boot  2) COMPASS logo reveal  3) scan-down dismiss.
 * Adapted from /atelier/glaze/src/boot/index.ts.
 */

import './style.css';

const LOGO_SRC = '/logo.svg';
const LOGO_SIZE = 96;

// ── Audio ─────────────────────────────────────────────────────────────────────

let _ctx = null;

function audioCtx() {
  if (!_ctx) {
    try { _ctx = new AudioContext(); } catch { return null; }
  }
  if (_ctx.state === 'suspended') _ctx.resume().catch(() => {});
  return _ctx;
}

function playLine(tag) {
  const c = audioCtx();
  if (!c) return;
  const dur  = tag === 'ok' ? 0.022 : 0.014;
  const freq = tag === 'ok' ? 1400 : 900;
  const vol  = tag === 'ok' ? 0.22 : 0.16;
  const bufSize = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = 3;
  const gain = c.createGain();
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  src.start();
  src.stop(c.currentTime + dur + 0.005);
}

function playReady() {
  const c = audioCtx();
  if (!c) return;
  [880, 1320].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = c.currentTime + i * 0.13;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.055, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.start(t);
    osc.stop(t + 0.25);
  });
}

function playScanStep(step, total) {
  const c = audioCtx();
  if (!c) return;
  const bufSize = Math.floor(c.sampleRate * 0.045);
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2600 - (step / total) * 1800;
  filter.Q.value = 5;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.07, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.06);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  src.start();
  src.stop(c.currentTime + 0.07);
}

// ── State ─────────────────────────────────────────────────────────────────────

const SESSION_KEY = 'compass:booted';

export function shouldBoot() {
  return !sessionStorage.getItem(SESSION_KEY);
}

export function markBooted() {
  sessionStorage.setItem(SESSION_KEY, '1');
}

// ── Boot lines — 7 dmesg + 15 systemd (22 total) ─────────────────────────────

const LINES = [
  { ts: '[    0.000]', tag: 'none', text: 'UEFI v2.8 — CPS-BIOS-1.0.4 (Compass Systems, 05/24/2026)' },
  { ts: '[    0.012]', tag: 'none', text: 'CPU: CompassCore™ 4-Core @ 3200MHz — stepping 0x1, x86_64' },
  { ts: '[    0.013]', tag: 'none', text: 'Memory: 16384 MB DDR5-4800 ECC — OK' },
  { ts: '[    0.031]', tag: 'none', text: 'ACPI: RSDP 0x00000000FECA0014 (v02 CPSSYS)' },
  { ts: '[    0.057]', tag: 'none', text: 'clocksource: tsc-early mask: 0xffffffffffffffff' },
  { ts: '[    0.088]', tag: 'none', text: 'kernel: 312 modules loaded — initrd: 28.4 MB' },
  { ts: '[    0.104]', tag: 'none', text: 'udev[1]: starting device manager' },
  { ts: '[    0.201]', tag: 'wait', text: 'Starting Project Store...' },
  { ts: '[    0.289]', tag: 'ok',   text: 'Started Project Store — localStorage bridge OK.' },
  { ts: '[    0.334]', tag: 'wait', text: 'Starting Stage Engine...' },
  { ts: '[    0.401]', tag: 'ok',   text: 'Started Stage Engine — dependency resolver ready.' },
  { ts: '[    0.445]', tag: 'wait', text: 'Starting Template Parser...' },
  { ts: '[    0.502]', tag: 'ok',   text: 'Started Template Parser — version flags loaded.' },
  { ts: '[    0.556]', tag: 'wait', text: 'Starting Export Engine...' },
  { ts: '[    0.601]', tag: 'ok',   text: 'Started Export Engine — JSON/Markdown writers OK.' },
  { ts: '[    0.644]', tag: 'wait', text: 'Starting Import Service...' },
  { ts: '[    0.701]', tag: 'ok',   text: 'Started Import Service — drag-and-drop listener active.' },
  { ts: '[    0.744]', tag: 'wait', text: 'Starting AI Prompt Generator...' },
  { ts: '[    0.801]', tag: 'ok',   text: 'Started AI Prompt Generator — planning template ready.' },
  { ts: '[    0.844]', tag: 'wait', text: 'Starting Compass Runtime v0.1...' },
  { ts: '[    0.891]', tag: 'ok',   text: 'Started Compass Runtime v0.1.' },
  { ts: '[    0.934]', tag: 'ok',   text: 'Reached target Compass System Ready.' },
];

// Letters sourced from Glaze templates (Block figlet font):
// C←CHAT  O←BOARD  M←MAIL  P←Block  A←CHAT  S←DESIGN  S←DESIGN
const COMPASS_ASCII = ` ██████╗  ██████╗ ███╗   ███╗██████╗  █████╗ ███████╗███████╗
██╔════╝██╔═══██╗████╗ ████║██╔══██╗██╔══██╗██╔════╝██╔════╝
██║     ██║   ██║██╔████╔██║██████╔╝███████║███████╗███████╗
██║     ██║   ██║██║╚██╔╝██║██╔═══╝ ██╔══██║╚════██║╚════██║
╚██████╗╚██████╔╝██║ ╚═╝ ██║██║     ██║  ██║███████║███████║
 ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝`;


// ── Helpers ───────────────────────────────────────────────────────────────────

function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function nextFrame() {
  return new Promise(res => requestAnimationFrame(() => res()));
}

// ── Scan dismiss (reused by navigation and boot phase 3) ──────────────────────

export async function showScan() {
  if (document.querySelector('.boot-scan-bar')) return;

  const overlay = document.createElement('div');
  overlay.className = 'boot-overlay';
  document.body.appendChild(overlay);

  const scanBar = document.createElement('div');
  scanBar.className = 'boot-scan-bar';
  document.body.appendChild(scanBar);

  await nextFrame();

  const SCAN_STEPS = 6;
  const SCAN_DURATION = 640;
  for (let i = 0; i < SCAN_STEPS; i++) {
    setTimeout(() => playScanStep(i, SCAN_STEPS), i * (SCAN_DURATION / SCAN_STEPS));
  }
  scanBar.classList.add('active');
  overlay.classList.add('scanning');

  await wait(680);
  overlay.remove();
  scanBar.remove();
}

function buildLine(l) {
  const el = document.createElement('div');
  el.className = 'boot-line';

  let html = `<span class="bt-ts">${l.ts}</span> `;

  if (l.tag === 'ok') {
    html += `<span class="bt-ok">[  OK  ]</span> <span class="bt-text">${l.text}</span>`;
  } else if (l.tag === 'wait') {
    html += `         <span class="bt-muted">${l.text}</span>`;
  } else {
    html += `<span class="bt-muted">${l.text}</span>`;
  }

  el.innerHTML = html;
  return el;
}

// ── Full boot sequence ────────────────────────────────────────────────────────

export async function showBoot() {
  const overlay = document.createElement('div');
  overlay.className = 'boot-overlay';

  const terminal = document.createElement('div');
  terminal.className = 'boot-terminal';
  const lineEls = LINES.map(buildLine);
  lineEls.forEach(el => terminal.appendChild(el));

  const logoStage = document.createElement('div');
  logoStage.className = 'boot-logo-stage';

  const ascii = document.createElement('pre');
  ascii.className = 'boot-ascii';
  ascii.textContent = COMPASS_ASCII;

  const pixelWrap = document.createElement('div');
  pixelWrap.className = 'boot-pixel-logo';
  const logoImg = document.createElement('img');
  logoImg.src = LOGO_SRC;
  logoImg.width = LOGO_SIZE;
  logoImg.height = LOGO_SIZE;
  logoImg.setAttribute('aria-hidden', 'true');
  pixelWrap.appendChild(logoImg);

  logoStage.appendChild(ascii);
  logoStage.appendChild(pixelWrap);
  overlay.appendChild(terminal);
  overlay.appendChild(logoStage);
  document.body.appendChild(overlay);

  const scanBar = document.createElement('div');
  scanBar.className = 'boot-scan-bar';
  document.body.appendChild(scanBar);

  // Phase 1: terminal boot
  for (let i = 0; i < lineEls.length; i++) {
    await wait(i < 7 ? 45 : 85);
    lineEls[i].classList.add('visible');
    playLine(LINES[i].tag);
  }
  await wait(380);
  playReady();

  // Phase 2: logo reveal
  terminal.style.transition = 'opacity 350ms ease';
  terminal.style.opacity = '0';
  await wait(350);
  terminal.style.display = 'none';

  logoStage.classList.add('visible');
  await wait(300);

  ascii.classList.add('lifted');
  await wait(500);

  pixelWrap.classList.add('visible');
  await wait(900);

  // Phase 3: scan dismiss
  const SCAN_STEPS = 6;
  const SCAN_DURATION = 640;
  for (let i = 0; i < SCAN_STEPS; i++) {
    setTimeout(() => playScanStep(i, SCAN_STEPS), i * (SCAN_DURATION / SCAN_STEPS));
  }
  scanBar.classList.add('active');
  overlay.classList.add('scanning');

  await wait(680);
  overlay.remove();
  scanBar.remove();
}

// ── Replay button ─────────────────────────────────────────────────────────────

export function mountReplayButton() {
  const btn = document.createElement('button');
  btn.className = 'boot-replay-btn';
  btn.textContent = '[ REBOOT ]';
  btn.addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    showBoot();
  });
  document.body.appendChild(btn);
}

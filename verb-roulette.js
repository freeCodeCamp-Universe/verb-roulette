// ── Language registry ────────────────────────────────────────
const LANGUAGES = { en: VERBS_EN, de: VERBS_DE, nl: VERBS_NL, sv: VERBS_SV, da: VERBS_DA, is: VERBS_IS, no: VERBS_NO, pt: VERBS_PT, es: VERBS_ES, fr: VERBS_FR, it: VERBS_IT };
let currentLang  = 'en';
let ALL_VERBS    = LANGUAGES.en.verbs;
let LANG_CONFIG  = LANGUAGES.en.config;

// ── Wheel verbs ───────────────────────────────────────────────
let wheelVerbs = [];

function pickWheelVerbs() {
  const shuffled = [...ALL_VERBS].sort(() => Math.random() - 0.5);
  wheelVerbs = shuffled.slice(0, 10);
}

let selectedTime = 10;

function getWheelColors() {
  const light = document.documentElement.dataset.theme === 'light';
  return {
    even:      light ? '#eaeaef' : '#1b1b32',
    odd:       light ? '#f5f6f7' : '#2a2a40',
    textEven:  light ? '#002ead' : '#99c9ff',
    textOdd:   light ? '#2a2a40' : '#dfdfe2',
    stroke:    '#767688',
    hubFill:   light ? '#ffffff' : '#0a0a23',
    hubStroke: '#767688',
  };
}

// ── Sound engine ─────────────────────────────────────────────
let sfxEnabled = true;

function setSfx(val) {
  sfxEnabled = val;
  localStorage.setItem('verb-roulette-sfx', val ? '1' : '0');
  const btn = document.getElementById('soundToggle');
  if (!btn) return;
  btn.setAttribute('data-sfx', val ? 'on' : 'off');
  btn.setAttribute('aria-label', val ? 'Sound on' : 'Sound off');
}

let _actx = null;
function ac() {
  if (!_actx) _actx = new (window.AudioContext || window.webkitAudioContext)();
  if (_actx.state === 'suspended') _actx.resume();
  return _actx;
}

const SFX = {
  spinTicks() {
    if (!sfxEnabled) return;
    const c = ac(); let t = 0, gap = 0.04;
    while (t < 3.8) {
      const at = c.currentTime + t;
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'triangle'; o.frequency.value = 900 + Math.random() * 400;
      g.gain.setValueAtTime(0.07, at);
      g.gain.exponentialRampToValueAtTime(0.001, at + 0.025);
      o.connect(g); g.connect(c.destination);
      o.start(at); o.stop(at + 0.025);
      t += gap; gap *= 1.09;
    }
  },
  land() {
    if (!sfxEnabled) return;
    const c = ac(), o = c.createOscillator(), g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(220, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(70, c.currentTime + 0.2);
    g.gain.setValueAtTime(0.28, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.25);
    o.connect(g); g.connect(c.destination);
    o.start(); o.stop(c.currentTime + 0.25);
  },
  reveal() {
    if (!sfxEnabled) return;
    const c = ac(), o = c.createOscillator(), g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(660, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(880, c.currentTime + 0.08);
    g.gain.setValueAtTime(0.22, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.55);
    o.connect(g); g.connect(c.destination);
    o.start(); o.stop(c.currentTime + 0.55);
  },
  perfect() {
    if (!sfxEnabled) return;
    const c = ac();
    [523, 659, 784].forEach((freq, i) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      const t = c.currentTime + i * 0.1;
      g.gain.setValueAtTime(0.22, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + 0.5);
    });
  },
  streak() {
    if (!sfxEnabled) return;
    const c = ac();
    [784, 988, 1047, 1319].forEach((freq, i) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      const t = c.currentTime + i * 0.08;
      g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + 0.35);
    });
  },
  correct() {
    if (!sfxEnabled) return;
    const c = ac();
    [523, 659].forEach((freq, i) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      const t = c.currentTime + i * 0.12;
      g.gain.setValueAtTime(0.2, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + 0.4);
    });
  },
  wrong() {
    if (!sfxEnabled) return;
    const c = ac(), o = c.createOscillator(), g = c.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(280, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(90, c.currentTime + 0.4);
    g.gain.setValueAtTime(0.15, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4);
    o.connect(g); g.connect(c.destination);
    o.start(); o.stop(c.currentTime + 0.4);
  },
  timeup() {
    if (!sfxEnabled) return;
    const c = ac();
    [440, 330, 220].forEach((freq, i) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'square'; o.frequency.value = freq;
      const t = c.currentTime + i * 0.13;
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + 0.1);
    });
  },
  tick() {
    if (!sfxEnabled) return;
    const c = ac(), o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = 1000;
    g.gain.setValueAtTime(0.08, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.04);
    o.connect(g); g.connect(c.destination);
    o.start(); o.stop(c.currentTime + 0.04);
  },
};

// ── State ────────────────────────────────────────────────────
let state           = 'idle';
let currentVerb     = null;
let totalScore      = 0;
let streak          = 0;
let round           = 0;
let timeLeft        = 0;
let timerInterval   = null;
let currentRotation = 0;

// ── Utils ────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

function norm(s) { return s.trim().toLowerCase(); }

function sectorPath(cx, cy, r, startDeg, endDeg) {
  const s = startDeg * Math.PI / 180;
  const e = endDeg   * Math.PI / 180;
  const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
  const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
  return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`;
}

// ── Build wheel ──────────────────────────────────────────────
function buildWheel() {
  const g = $('wheel-group');
  g.innerHTML = '';
  const n = wheelVerbs.length;
  const cx = 150, cy = 150, r = 130, textR = 90;
  const slice = 360 / n;

  wheelVerbs.forEach((verb, i) => {
    const start = i * slice - 90;
    const end   = start + slice;
    const mid   = start + slice / 2;

    const c = getWheelColors();
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', sectorPath(cx, cy, r, start, end));
    path.setAttribute('fill',         i % 2 === 0 ? c.even : c.odd);
    path.setAttribute('stroke',       c.stroke);
    path.setAttribute('stroke-width', '1.5');
    g.appendChild(path);

    const midRad = mid * Math.PI / 180;
    const tx = cx + textR * Math.cos(midRad);
    const ty = cy + textR * Math.sin(midRad);

    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    txt.setAttribute('x', tx);
    txt.setAttribute('y', ty);
    txt.setAttribute('text-anchor',       'middle');
    txt.setAttribute('dominant-baseline', 'middle');
    txt.setAttribute('fill',              i % 2 === 0 ? c.textEven : c.textOdd);
    txt.setAttribute('font-size',         '10.5');
    txt.setAttribute('font-family',       "'Fira Mono', monospace");
    txt.setAttribute('font-weight',       'bold');
    const normMid = ((mid % 360) + 360) % 360;
    const textRot = (normMid > 90 && normMid <= 270) ? mid + 180 : mid;
    txt.setAttribute('transform',         `rotate(${textRot},${tx},${ty})`);
    txt.textContent = verb.inf;
    g.appendChild(txt);
  });

  const wc = getWheelColors();
  const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  ring.setAttribute('cx', cx); ring.setAttribute('cy', cy);
  ring.setAttribute('r',  r);
  ring.setAttribute('fill', 'none');
  ring.setAttribute('stroke', wc.stroke);
  ring.setAttribute('stroke-width', '2');
  g.appendChild(ring);

  const hub = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  hub.setAttribute('cx', cx); hub.setAttribute('cy', cy);
  hub.setAttribute('r', 14);
  hub.setAttribute('fill',         wc.hubFill);
  hub.setAttribute('stroke',       wc.hubStroke);
  hub.setAttribute('stroke-width', '1.5');
  g.appendChild(hub);
}

// ── Spin ─────────────────────────────────────────────────────
function spin() {
  if (state !== 'idle') return;
  state = 'spinning';
  $('spinBtn').disabled = true;

  const idx   = Math.floor(Math.random() * wheelVerbs.length);
  currentVerb = wheelVerbs[idx];
  round++;
  $('sRound').textContent = round;

  const slice       = 360 / wheelVerbs.length;
  const centerDrawn = idx * slice - 90 + slice / 2;
  const targetBase  = ((270 - centerDrawn) % 360 + 360) % 360;
  const curMod      = currentRotation % 360;
  const diff        = ((targetBase - curMod) % 360 + 360) % 360 || 360;
  currentRotation  += 5 * 360 + diff;

  const g = $('wheel-group');
  g.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
  g.style.transform  = `rotate(${currentRotation}deg)`;
  SFX.spinTicks();
  setTimeout(() => SFX.land(), 4050);
  setTimeout(showReveal, 4100);
}

// ── Reveal ───────────────────────────────────────────────────
function showReveal() {
  const panel = $('challenge');
  panel.classList.add('visible');

  $('verb-translation').textContent = (currentLang !== 'en' && currentVerb.tr) ? currentVerb.tr : '';

  const revealEl = $('verb-reveal');
  revealEl.textContent      = currentVerb.inf.toUpperCase();
  revealEl.style.opacity    = '1';
  revealEl.style.transition = 'none';

  clearInputs();
  setInputsVisible(false);
  $('timer-bar').style.transition = 'none';
  $('timer-bar').style.width      = '100%';
  $('timer-bar').style.background = 'var(--green)';
  $('timer-count').textContent    = selectedTime || '∞';
  $('timerRow').className         = 'timer-row' + (selectedTime === 0 ? ' hidden' : '');
  $('score-popup').textContent    = '';
  $('score-popup').className      = '';
  $('answer-line').className      = '';

  SFX.reveal();
  setTimeout(startChallenge, 1400);
}

// ── Challenge ────────────────────────────────────────────────
function startChallenge() {
  state = 'challenge';
  setInputsVisible(true);

  $('inf-input').value        = currentVerb.inf;
  $('inf-input').readOnly     = true;
  $('past-input').placeholder = LANG_CONFIG.pastHint || '…';
  $('past-input').focus();

  if (selectedTime > 0) {
    $('timer-bar').style.transition = `width ${selectedTime}s linear, background-color 0.5s`;
    $('timer-bar').style.width      = '0%';
    timeLeft = selectedTime;

    timerInterval = setInterval(() => {
      timeLeft--;
      $('timer-count').textContent = Math.max(timeLeft, 0);

      if      (timeLeft <= selectedTime * 0.2) $('timer-bar').style.backgroundColor = 'var(--red)';
      else if (timeLeft <= selectedTime * 0.4) $('timer-bar').style.backgroundColor = 'var(--yellow)';

      if (timeLeft <= 3 && timeLeft > 0) SFX.tick();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        checkAnswer(true);
      }
    }, 1000);
  }
}

// ── Check ────────────────────────────────────────────────────
function checkAnswer(timeUp = false) {
  if (state !== 'challenge') return;
  state = 'result';
  clearInterval(timerInterval);
  timerInterval = null;

  const bar = $('timer-bar');
  bar.style.transition = 'none';
  bar.style.width      = bar.getBoundingClientRect().width /
                         bar.parentElement.getBoundingClientRect().width * 100 + '%';

  const pastVal = norm($('past-input').value);
  const ppVal   = norm($('pp-input').value);

  const infOk  = true;
  const pastOk = pastVal === norm(currentVerb.past);
  const ppOk   = ppVal   === norm(currentVerb.pp);

  $('inf-input').className  = 'verb-input correct';
  $('past-input').className = 'verb-input ' + (pastOk ? 'correct' : 'wrong');
  $('pp-input').className   = 'verb-input ' + (ppOk   ? 'correct' : 'wrong');
  $('inf-input').setAttribute('aria-invalid',  'false');
  $('past-input').setAttribute('aria-invalid', pastOk ? 'false' : 'true');
  $('pp-input').setAttribute('aria-invalid',   ppOk   ? 'false' : 'true');


  $('ans-inf').textContent   = currentVerb.inf;
  $('ans-past').textContent  = currentVerb.past;
  $('ans-pp').textContent    = currentVerb.pp;
  $('answer-line').className = 'show';

  const correct  = [infOk, pastOk, ppOk].filter(Boolean).length;
  const allOk    = correct === 3;
  const speed    = allOk && !timeUp && selectedTime > 0 ? timeLeft * 20 : 0;
  const pts      = correct * 100 + (allOk ? 100 : 0) + speed;

  if (allOk) streak++;
  else       streak = 0;

  const streakBonus = allOk && streak > 1 ? (streak - 1) * 50 : 0;
  const roundTotal  = pts + streakBonus;
  totalScore       += roundTotal;

  $('sScore').textContent  = totalScore;
  $('sStreak').textContent = streak;

  if (timeUp) SFX.timeup();
  else if (allOk) streak > 1 ? SFX.streak() : SFX.perfect();
  else if (correct > 0) SFX.correct();
  else SFX.wrong();

  const popup = $('score-popup');
  if (allOk) {
    popup.className   = 'perfect';
    popup.textContent = `+${roundTotal} pts${streak > 1 ? '  ×' + streak + ' streak!' : ''}`;
  } else if (correct > 0) {
    popup.className   = 'partial';
    popup.textContent = `+${roundTotal} pts  (${correct}/3 correct)`;
  } else {
    popup.className   = 'miss';
    popup.textContent = timeUp ? 'Time up — 0 pts' : '0 pts';
  }

  $('checkBtn').style.display = 'none';
  $('nextBtn').style.display  = 'block';
}

// ── Reset ─────────────────────────────────────────────────────
function resetToIdle() {
  clearInterval(timerInterval);
  timerInterval = null;
  state = 'idle';
  $('spinBtn').disabled = false;
  $('challenge').classList.remove('visible');
  $('checkBtn').style.display = 'block';
  $('nextBtn').style.display  = 'none';
  pickWheelVerbs();
  buildWheel();
}

// ── Helpers ───────────────────────────────────────────────────
function clearInputs() {
  ['inf-input', 'past-input', 'pp-input'].forEach(id => {
    const el = $(id);
    el.value     = '';
    el.readOnly  = false;
    el.className = 'verb-input';
    el.removeAttribute('aria-invalid');
  });
}

function setInputsVisible(show) {
  const opacity = show ? '1' : '0';
  const ptr     = show ? '' : 'none';
  ['.input-row', '.btn-check'].forEach(sel => {
    const el = document.querySelector(sel);
    if (el) { el.style.opacity = opacity; el.style.pointerEvents = ptr; }
  });
}

// ── Language switching ────────────────────────────────────────
function updateLabels() {
  $('lbl-inf').textContent  = LANG_CONFIG.labels.inf;
  $('lbl-past').textContent = LANG_CONFIG.labels.past;
  $('lbl-pp').textContent   = LANG_CONFIG.labels.pp;
}

function renderTheory() {
  $('theoryGrid').innerHTML = LANG_CONFIG.theory.map(card => `
    <div class="theory-card">
      <div class="theory-card-title">${card.title}</div>
      <div class="theory-card-sub">${card.sub}</div>
      <ul class="theory-list">
        ${card.items.map(item => `<li>${item.rule}<code>${item.example}</code></li>`).join('')}
      </ul>
    </div>
  `).join('');
}

function switchLanguage(code) {
  if (code === currentLang) return;
  clearInterval(timerInterval);
  timerInterval = null;
  $('challenge').classList.remove('visible');

  currentLang = code;
  ALL_VERBS   = LANGUAGES[code].verbs;
  LANG_CONFIG = LANGUAGES[code].config;

  updateLabels();
  renderTheory();

  state = 'idle';
  totalScore = streak = round = 0;
  $('sScore').textContent = $('sStreak').textContent = $('sRound').textContent = '0';
  $('spinBtn').disabled   = false;
  $('checkBtn').style.display = 'block';
  $('nextBtn').style.display  = 'none';
  currentRotation = 0;
  const g = $('wheel-group');
  g.style.transition = 'none';
  g.style.transform  = 'rotate(0deg)';
  pickWheelVerbs();
  buildWheel();
}

// ── Language picker ───────────────────────────────────────────
document.querySelectorAll('#langPicker .time-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#langPicker .time-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    switchLanguage(btn.dataset.lang);
  });
});

// ── Keyboard nav ─────────────────────────────────────────────
['inf-input', 'past-input', 'pp-input'].forEach((id, i, arr) => {
  $(id).addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (i < arr.length - 1) $(arr[i + 1]).focus();
    else checkAnswer();
  });
});

// ── Time picker ───────────────────────────────────────────────
document.querySelectorAll('#timePicker .time-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    if (state !== 'idle') return;
    document.querySelectorAll('#timePicker .time-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedTime = parseInt(btn.dataset.val);
  });
});

// ── Events ───────────────────────────────────────────────────
$('spinBtn').addEventListener('click', spin);
$('checkBtn').addEventListener('click', () => checkAnswer());
$('nextBtn').addEventListener('click', resetToIdle);
$('challengeClose').addEventListener('click', resetToIdle);

// ── Verb list modal ───────────────────────────────────────────
const ROMANCE_LANGS = new Set(['fr', 'es', 'it', 'pt']);

let _vlSorted = [];
let _vlShowTr = false;
let _vlIs3sg  = false;

function _vlRows(verbs) {
  return verbs.map(v => `<tr>
    <td>${v.inf}</td><td>${v.past}</td><td>${v.pp}</td>
    ${_vlShowTr ? `<td class="vl-tr">${v.tr || ''}</td>` : ''}
  </tr>`).join('');
}

function renderVerbList() {
  _vlSorted = [...ALL_VERBS].sort((a, b) => a.inf.localeCompare(b.inf));
  const { inf, past, pp } = LANG_CONFIG.labels;
  _vlShowTr = currentLang !== 'en';
  _vlIs3sg  = ROMANCE_LANGS.has(currentLang);
  const pastHead = _vlIs3sg ? `${past}*` : past;

  $('verbListSearch').value = '';
  $('verbListTitle').textContent = `${LANG_CONFIG.name} — ${_vlSorted.length} verbs`;
  $('verbListTable').innerHTML = `
    <thead><tr>
      <th>${inf}</th><th>${pastHead}</th><th>${pp}</th>
      ${_vlShowTr ? '<th>Translation</th>' : ''}
    </tr></thead>
    <tbody>${_vlRows(_vlSorted)}</tbody>
  `;
  $('verbListFootnote').textContent = _vlIs3sg ? '* 3rd person singular (he/she)' : '';
}

function filterVerbList(query) {
  const q = query.trim().toLowerCase();
  const hits = q
    ? _vlSorted.filter(v =>
        v.inf.toLowerCase().includes(q) ||
        v.past.toLowerCase().includes(q) ||
        v.pp.toLowerCase().includes(q) ||
        (_vlShowTr && (v.tr || '').toLowerCase().includes(q))
      )
    : _vlSorted;
  $('verbListTitle').textContent = q
    ? `${LANG_CONFIG.name} — ${hits.length} / ${_vlSorted.length}`
    : `${LANG_CONFIG.name} — ${_vlSorted.length} verbs`;
  $('verbListTable').querySelector('tbody').innerHTML = _vlRows(hits);
}

function openVerbList()  { renderVerbList(); $('verblist-modal').classList.add('visible'); }
function closeVerbList() { $('verblist-modal').classList.remove('visible'); }

// ── Theory modal ─────────────────────────────────────────────
function openTheory()  { $('theory-modal').classList.add('visible'); }
function closeTheory() { $('theory-modal').classList.remove('visible'); }

$('verbListBtn').addEventListener('click', openVerbList);
$('verbListClose').addEventListener('click', closeVerbList);
$('verbListSearch').addEventListener('input', e => filterVerbList(e.target.value));
$('verblist-modal').addEventListener('click', e => {
  if (e.target === $('verblist-modal')) closeVerbList();
});

$('theoryBtn').addEventListener('click', openTheory);
$('theoryClose').addEventListener('click', closeTheory);
$('theory-modal').addEventListener('click', e => {
  if (e.target === $('theory-modal')) closeTheory();
});

// ── Theme toggle ─────────────────────────────────────────────
(function () {
  const btn = document.getElementById('themeToggle');

  function applyTheme(light) {
    if (light) {
      document.documentElement.dataset.theme = 'light';
      btn.textContent = '🌙';
      btn.setAttribute('aria-label', 'Switch to dark theme');
    } else {
      delete document.documentElement.dataset.theme;
      btn.textContent = '☀️';
      btn.setAttribute('aria-label', 'Switch to light theme');
    }
    localStorage.setItem('verb-roulette-theme', light ? 'light' : 'dark');
    buildWheel();
  }

  if (document.documentElement.dataset.theme === 'light') {
    btn.textContent = '🌙';
    btn.setAttribute('aria-label', 'Switch to dark theme');
  }

  btn.addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme !== 'light');
  });
})();

// ── Sound toggle init ─────────────────────────────────────────
document.getElementById('soundToggle').addEventListener('click', () => setSfx(!sfxEnabled));
(function () {
  const saved = localStorage.getItem('verb-roulette-sfx');
  if (saved !== null) setSfx(saved === '1');
})();

// ── Init ─────────────────────────────────────────────────────
updateLabels();
renderTheory();
pickWheelVerbs();
buildWheel();

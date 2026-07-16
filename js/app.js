/* ============================================================
   서트레스 SHUTRESS — 메인 로직
   ① 두두 캐릭터 SVG 빌더  ② 검색/필터/정렬  ③ 명함 교환 모달
   ④ 뿌셔존(도구 5종 + 물바가지 + 도망/그로기)  ⑤ 실집계 랭킹
   ⑥ 플레이리스트(PULSE ORIGIN 69% 우선)
   ============================================================ */

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const fmt = n => n.toLocaleString('ko-KR');
const rand = arr => arr[Math.floor(Math.random() * arr.length)];
const rnd = (min, max) => min + Math.random() * (max - min);
const STARS = ['✦', '✧', '✺', '✹'];

/* 스트레스 총량(내부 포인트). 100%를 채우는 데 필요한 양 —
   기존(100) 대비 3배로 올려 해소율이 최소 3배 천천히 오르게 한다. */
const STRESS_MAX = 300;

/* ============================================================
   실집계 저장소 (localStorage — 이 기기 기준 집계)
   ============================================================ */
const STORE_KEY = 'shutress-store-v1';
function loadStore() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
  catch (_) { return {}; }
}
const store = Object.assign(
  { perChar: {}, totalHits: 0, totalClears: 0, bestCombo: 0, waters: 0, grabs: 0 },
  loadStore()
);
function saveStore() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (_) {}
}
const charHits = id => (store.perChar[id] || {}).hits || 0;
function bump(id, field, n = 1) {
  const c = store.perChar[id] = store.perChar[id] || { hits: 0, clears: 0 };
  c[field] += n;
  saveStore();
  // 전역 랭킹이 켜져 있으면 집계 숫자만 서버로 전송(버퍼링)
  Ranking.queue(id, field === 'hits' ? n : 0, field === 'clears' ? n : 0);
}

/* ---------- 전역 상태 ---------- */
const state = {
  query: '', filter: 'all', sort: 'pop',
  selected: CHARACTERS[0], name: CHARACTERS[0].defaultName,
  pending: null,
  tool: 'punch',
  hits: 0, combo: 0, bestCombo: 0,
  stress: STRESS_MAX, cleared: false,
  comboTimer: null,
  escaping: false, escTimer: null, escFailT: null, escHopT: null, escCntT: null,
  groggy: false, lastGroggy: 0,
  waterReady: 0,
  musicStarted: false,          // 첫 타격 때 유튜브 자동 재생
  lastInput: Date.now(), regenAcc: 0
};
const ALL_ANIMS = ['anim-punch-a', 'anim-punch-b', 'anim-punch-c', 'anim-pinch', 'anim-tickle', 'anim-squish', 'anim-grab', 'anim-dodge'];

/* ============================================================
   ① 두두(DUDU) 캐릭터 SVG 빌더 — design/ 스타터 키트 기반
   봉제인형 몸체 + 역할별 액세서리 + 표정 7종
   ============================================================ */
let svgUid = 0;
function charSVG(c, face = 'normal') {
  const g = `dudu-${c.id}-${++svgUid}`;  /* 인스턴스마다 고유 id — 중복 시 첫 정의가 숨겨지면 참조가 깨짐 */
  const [hi, lo] = DUDU_COLORS[c.color] || DUDU_COLORS.tan;
  return `
  <svg class="char-svg" viewBox="0 0 512 540" data-face="${face}" aria-hidden="true">
    <defs>
      <radialGradient id="${g}" cx="38%" cy="28%" r="78%">
        <stop offset="0%" stop-color="${hi}"/><stop offset="100%" stop-color="${lo}"/>
      </radialGradient>
    </defs>
    <ellipse cx="256" cy="502" rx="118" ry="16" fill="#000" opacity=".13"/>
    <g class="dudu">
      <!-- 몸통·팔·다리·머리 -->
      <g fill="url(#${g})">
        <rect x="120" y="260" width="66" height="145" rx="33" transform="rotate(8 153 332)"/>
        <rect x="326" y="260" width="66" height="145" rx="33" transform="rotate(-8 359 332)"/>
        <rect x="175" y="415" width="74" height="66" rx="28"/>
        <rect x="263" y="415" width="74" height="66" rx="28"/>
        <rect x="151" y="238" width="210" height="215" rx="93"/>
        <circle cx="256" cy="180" r="128"/>
      </g>
      <!-- 봉제 패치 & 볼터치 -->
      <path d="M182 356 h44 v44 h-44 z" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="5" stroke-dasharray="8 6"/>
      <ellipse class="cheekblush" cx="186" cy="216" rx="17" ry="10" fill="rgba(255,120,130,.32)"/>
      <ellipse class="cheekblush" cx="326" cy="216" rx="17" ry="10" fill="rgba(255,120,130,.32)"/>

      <!-- 표정: 기본 -->
      <g class="face f-normal">
        <ellipse class="eye" cx="213" cy="171" rx="15" ry="23"/>
        <ellipse class="eye" cx="299" cy="171" rx="15" ry="23"/>
        <path class="mouthfill" d="M221 225 Q256 260 291 225 Q286 205 256 205 Q226 205 221 225Z"/>
        <path d="M235 232 Q256 245 277 232" stroke="#B96060" stroke-width="9" stroke-linecap="round" fill="none"/>
      </g>
      <!-- 표정: 아야 (펀치) -->
      <g class="face f-ouch">
        <path class="fx" d="M186 152 l42 19 -42 19 M326 152 l-42 19 42 19"/>
        <ellipse class="mouthfill" cx="256" cy="240" rx="30" ry="24"/>
        <path class="tear" d="M354 126 q15 22 0 33 q-15 -11 0 -33z"/>
      </g>
      <!-- 표정: 찔끔 (꼬집기) -->
      <g class="face f-cry">
        <path class="fx" d="M192 176 q21 -20 42 0 M278 176 q21 -20 42 0"/>
        <path class="tear" d="M213 198 q13 24 0 36 q-13 -12 0 -36z"/>
        <path class="tear" d="M299 198 q13 24 0 36 q-13 -12 0 -36z"/>
        <path class="fx" d="M230 242 q13 -11 26 0 q13 11 26 0"/>
      </g>
      <!-- 표정: 웃음 (간지럼) -->
      <g class="face f-laugh">
        <path class="fx" d="M192 168 q21 -22 42 0 M278 168 q21 -22 42 0"/>
        <path class="mouthfill" d="M210 218 q46 44 92 0 q-14 36 -46 36 q-32 0 -46 -36z"/>
        <path d="M232 250 q24 14 48 0" stroke="#B96060" stroke-width="10" stroke-linecap="round" fill="none"/>
      </g>
      <!-- 표정: 그로기 (해롱해롱) -->
      <g class="face f-dizzy">
        <path class="fx" d="M194 152 l38 38 M232 152 l-38 38 M280 152 l38 38 M318 152 l-38 38"/>
        <ellipse class="mouthfill" cx="256" cy="240" rx="16" ry="20"/>
        <g class="dizzy-stars">
          <path class="star" d="M180 62 l8 16 18 3 -13 13 3 18 -16 -9 -16 9 3 -18 -13 -13 18 -3z"/>
          <path class="star" d="M320 44 l7 14 15 2 -11 11 3 15 -14 -7 -14 7 3 -15 -11 -11 15 -2z"/>
          <path class="star" d="M254 22 l6 12 13 2 -9 9 2 13 -12 -6 -12 6 2 -13 -9 -9 13 -2z"/>
        </g>
      </g>
      <!-- 표정: 화들짝 (물벼락/포획) -->
      <g class="face f-shock">
        <circle cx="213" cy="171" r="26" fill="#fff" stroke="#151515" stroke-width="8"/>
        <circle cx="299" cy="171" r="26" fill="#fff" stroke="#151515" stroke-width="8"/>
        <circle class="eye" cx="213" cy="171" r="9"/><circle class="eye" cx="299" cy="171" r="9"/>
        <ellipse class="mouthfill" cx="256" cy="242" rx="22" ry="26"/>
        <path class="fx" d="M148 94 l-16 -24 M364 94 l16 -24"/>
      </g>
      <!-- 표정: 짜부 (볼 짜부하기) -->
      <g class="face f-squish">
        <path class="fx" d="M190 171 h46 M276 171 h46"/>
        <circle cx="172" cy="212" r="27" fill="rgba(255,120,130,.5)"/>
        <circle cx="340" cy="212" r="27" fill="rgba(255,120,130,.5)"/>
        <path class="fx" d="M243 238 q13 -12 26 0 q-13 12 -26 0"/>
      </g>
      <!-- 표정: 퉁퉁 부음 (완전 해소 후) -->
      <g class="face f-swollen">
        <path class="fx" d="M192 172 q21 12 42 0 M278 172 q21 12 42 0"/>
        <circle cx="184" cy="216" r="31" fill="rgba(255,120,130,.55)"/>
        <circle cx="328" cy="216" r="31" fill="rgba(255,120,130,.55)"/>
        <path class="fx" d="M240 248 q16 10 32 0"/>
        <circle cx="178" cy="74" r="17" fill="rgba(255,120,130,.6)"/>
        <circle cx="200" cy="56" r="11" fill="rgba(255,120,130,.5)"/>
        <g transform="rotate(-18 330 84)"><rect x="300" y="72" width="62" height="23" rx="11" fill="#E8D9A8" stroke="#3A3230" stroke-width="5"/><path d="M318 78 v11 M331 78 v11 M344 78 v11" stroke="#C9B476" stroke-width="4" stroke-linecap="round" fill="none"/></g>
      </g>
      <!-- 표정: 뒷모습 (도망) — 얼굴 대신 등 재봉선 -->
      <g class="face f-back">
        <path d="M256 60 v226" stroke="rgba(0,0,0,.25)" stroke-width="6" stroke-dasharray="11 9" fill="none"/>
        <path d="M214 328 h58 v54 h-58 z" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="5" stroke-dasharray="8 6"/>
      </g>

      <!-- 역할별 액세서리 (뒷모습일 땐 숨김) -->
      <g class="accwrap">${ACCESSORIES[c.id] || ''}</g>
    </g>
  </svg>`;
}

/* ============================================================
   ② 대상 고르기 — 검색 / 필터 / 정렬
   ============================================================ */
const grid = $('#charGrid');
const emptyMsg = $('#emptyMsg');

function visibleCharacters() {
  const q = state.query.trim().toLowerCase();
  let list = CHARACTERS.filter(c => {
    const inGroup = state.filter === 'all' || c.group === state.filter;
    const hay = (c.name + c.role + c.desc + c.tags.join(' ')).toLowerCase();
    return inGroup && (!q || hay.includes(q));
  });
  return list.slice().sort((a, b) =>
    state.sort === 'name'
      ? a.name.localeCompare(b.name, 'ko')
      : charHits(b.id) - charHits(a.id) || a.name.localeCompare(b.name, 'ko')
  );
}

function renderGrid() {
  const list = visibleCharacters();
  emptyMsg.hidden = list.length > 0;
  grid.innerHTML = list.map(c => `
    <article class="char-card">
      <div class="char-card__art">${charSVG(c)}</div>
      <div class="char-card__body">
        <div class="char-card__top">
          <h3>${c.name}</h3>
          <span class="badge badge--${c.group}">${c.groupLabel}</span>
        </div>
        <p class="char-card__desc">${c.desc}</p>
        <p class="char-card__quote">${c.quote}</p>
        <div class="char-card__foot">
          <span class="char-card__pop">
            <svg class="icon" viewBox="0 0 24 24"><path d="M12 2c1 4-4 6-4 10a4 4 0 0 0 8 0c0-2-1-3-1-3s3 1 3 5a6 6 0 0 1-12 0C6 8 11 6 12 2z"/></svg>
            누적 ${fmt(charHits(c.id))}회 뿌셔짐
          </span>
          <button class="btn btn--sm" data-pick="${c.id}">뿌시러 가기</button>
        </div>
      </div>
    </article>`).join('');
}

const filterBox = $('#filterPills');
filterBox.innerHTML = GROUPS.map(g =>
  `<button class="pill ${g.id === 'all' ? 'is-on' : ''}" data-filter="${g.id}">${g.label}</button>`
).join('');
filterBox.addEventListener('click', e => {
  const btn = e.target.closest('[data-filter]');
  if (!btn) return;
  state.filter = btn.dataset.filter;
  $$('.pill', filterBox).forEach(p => p.classList.toggle('is-on', p === btn));
  renderGrid();
});
$('#searchInput').addEventListener('input', e => { state.query = e.target.value; renderGrid(); });
$('#sortSelect').addEventListener('change', e => { state.sort = e.target.value; renderGrid(); });
grid.addEventListener('click', e => {
  const btn = e.target.closest('[data-pick]');
  if (!btn) return;
  openCardModal(CHARACTERS.find(c => c.id === btn.dataset.pick));
});

/* ============================================================
   ③ 명함 교환 모달 — 선택한 캐릭터가 직접 명함을 건넨다
   ============================================================ */
const modal = $('#cardModal');
const nameInput = $('#nameInput');
const modalHint = $('#modalHint');
let modalTimers = [];

function openCardModal(char) {
  state.pending = char;
  $('#cardRole').textContent = char.name + ' (' + char.role + ')';
  $('#cardMini').innerHTML = charSVG(char);
  $('#greeter').innerHTML = charSVG(char);
  nameInput.value = '';
  nameInput.placeholder = '예: ' + char.defaultName;
  modalHint.textContent = char.name + '이(가) 명함을 건네는 중…';
  modal.className = 'modal';
  modal.hidden = false;
  modalTimers.forEach(clearTimeout);
  modalTimers = [
    setTimeout(() => modal.classList.add('s-in'), 60),
    setTimeout(() => modal.classList.add('s-swap'), 1000),
    setTimeout(() => {
      modal.classList.add('s-flip');
      modalHint.textContent = '명함 뒷면에 성함을 남겨주세요 ✏️';
      nameInput.focus();
    }, 1750)
  ];
}
function closeCardModal() {
  modalTimers.forEach(clearTimeout);
  modal.hidden = true;
  state.pending = null;
}
function confirmCard(useDefault) {
  const char = state.pending;
  if (!char) return;
  state.selected = char;
  state.name = (useDefault ? '' : nameInput.value.trim()) || char.defaultName;
  closeCardModal();
  resetGame();
  renderSmash();
  $('#smash').scrollIntoView({ behavior: 'smooth' });
}
$('#cardConfirm').addEventListener('click', () => confirmCard(false));
$('#cardSkip').addEventListener('click', () => confirmCard(true));
nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') confirmCard(false); });
modal.addEventListener('click', e => { if (e.target.hasAttribute('data-close')) closeCardModal(); });

/* ============================================================
   ④ 뿌셔존 — 도구 5종(1~5키) + 물바가지(Enter) + 도망/그로기
   ============================================================ */
const stage = $('#stage');
const charMove = $('#charMove');
const charBox = $('#charBox');
const charBubble = $('#charBubble');
const toolCursor = $('#toolCursor');
const clearOverlay = $('#clearOverlay');
const escapeOverlay = $('#escapeOverlay');
const comboEl = $('#combo');

const markInput = () => { state.lastInput = Date.now(); };

function currentTitle() {
  let t = TITLES[0][1];
  for (const [min, label] of TITLES) if (store.totalHits >= min) t = label;
  return t;
}
function renderHUD() {
  const relief = Math.round((1 - state.stress / STRESS_MAX) * 100);
  $('#reliefPct').textContent = relief + '%';
  $('#reliefBar').style.width = relief + '%';
  $('#hitCount').textContent = fmt(state.hits);
  $('#bestCombo').textContent = state.bestCombo;
  $('#userTitle').textContent = currentTitle();
}
function setFace(face) {
  const svg = $('.char-svg', charBox);
  if (svg) svg.dataset.face = face;
}
let faceTimer = null;
function flashFace(face, ms = 420) {
  setFace(face);
  clearTimeout(faceTimer);
  faceTimer = setTimeout(() => {
    if (state.cleared || state.groggy) setFace('dizzy');
    else setFace('normal');
  }, ms);
}
function renderSmash() {
  const c = state.selected;
  $('#nameTagText').innerHTML = `<b>${state.name}</b>&nbsp;${c.role}`;
  charBox.innerHTML = charSVG(c, state.cleared ? 'swollen' : 'normal');
  clearOverlay.hidden = !state.cleared;
  escapeOverlay.hidden = true;
  renderHUD();
}
function resetGame() {
  state.hits = 0; state.combo = 0; state.bestCombo = 0;
  state.stress = STRESS_MAX; state.cleared = false; state.groggy = false;
  state.escaping = false;                       // 도망 상태·예약 완전 초기화
  clearTimeout(state.escTimer);
  stopEscapeTimers();
  charMove.classList.remove('groggy', 'escaping', 'grab-return', 'walk-return');
  charMove.style.setProperty('--tx', '0px');
  charMove.style.setProperty('--ty', '0px');
  charMove.style.setProperty('--sc', '1');
  $('#groggyTag').hidden = true;
  escapeTag.hidden = true;
  escapeOverlay.hidden = true;
  comboEl.classList.remove('is-show');
  markInput();
  scheduleEscape();                             // 도망 타이머 새로 예약
}

/* 말풍선 */
let bubbleTimer = null;
function bubble(text, ms = 1600) {
  charBubble.textContent = text;
  charBubble.hidden = false;
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => { charBubble.hidden = true; }, ms);
}

/* 도구 버튼 + 물 버튼 */
const toolBox = $('#toolBtns');
toolBox.innerHTML = Object.entries(TOOLS).map(([id, t]) => `
  <button class="tool-btn ${id === state.tool ? 'is-on' : ''}" data-tool="${id}">
    <b class="key">${t.key}</b>
    <svg class="icon" viewBox="0 0 24 24">${t.icon}</svg>${t.label}<small>${t.hint}</small>
  </button>`).join('') + `
  <button class="tool-btn tool-btn--water" id="waterBtn">
    <b class="key">↵</b>
    <svg class="icon" viewBox="0 0 24 24">${WATER.icon}</svg>${WATER.label}<small>해소 +${WATER.power} · 4초 쿨타임</small>
    <i class="cool" id="waterCool"></i>
  </button>`;

function selectTool(id) {
  state.tool = id;
  $$('.tool-btn[data-tool]', toolBox).forEach(b => b.classList.toggle('is-on', b.dataset.tool === id));
  toolCursor.dataset.tool = id;
  toolCursor.innerHTML = `<svg class="icon" viewBox="0 0 24 24">${TOOLS[id].icon}</svg>`;
}
toolBox.addEventListener('click', e => {
  const btn = e.target.closest('[data-tool]');
  if (btn) { selectTool(btn.dataset.tool); markInput(); }
});
$('#waterBtn').addEventListener('click', () => splashWater());
selectTool('punch');

/* 파티클 */
function spawnParticle(x, y, text, star = false, cls = '') {
  const el = document.createElement('span');
  el.className = `pword ${star ? 'pword--star' : ''} ${cls || 'pc-' + (1 + Math.floor(Math.random() * 4))}`;
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.setProperty('--rot', rnd(-16, 16) + 'deg');
  stage.appendChild(el);
  setTimeout(() => el.remove(), 900);
}
function shakeStage() {
  stage.classList.remove('shake');
  void stage.offsetWidth;
  stage.classList.add('shake');
}
function hitFlash() {
  const f = document.createElement('i');
  f.className = 'hitflash';
  stage.appendChild(f);
  setTimeout(() => f.remove(), 260);
}

/* ---------- 도구별 화려한 이펙트 오버레이 ---------- */
const HAND_SVG = `<svg viewBox="0 0 48 48"><g fill="#F0C58E" stroke="#3A3230" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"><path d="M15 30V17a3 3 0 0 1 6 0v9"/><path d="M21 26V13a3 3 0 0 1 6 0v13"/><path d="M27 27V16a3 3 0 0 1 6 0v11"/><path d="M33 28v-7a3 3 0 0 1 6 0v10c0 7-5 12-12 12s-11-4-13-11l-2-6a3 3 0 0 1 5.4-2.4L21 30"/></g></svg>`;
const GLOVE_SVG = `<svg viewBox="0 0 72 64"><g stroke="#7C1F1F" stroke-width="2.6" stroke-linejoin="round"><rect x="4" y="24" width="15" height="20" rx="4" fill="#B5321F"/><path d="M19 15h27a17 17 0 0 1 0 34H19z" fill="#E04E4E"/><path d="M19 30h9a7 7 0 0 1 0 12h-9z" fill="#C0392B"/></g></svg>`;
const FEATHER_SVG = `<svg viewBox="0 0 48 48"><g stroke="#2EB67D" stroke-width="2.6" stroke-linejoin="round"><path d="M41 7C22 9 12 24 10 41c15-2 31-11 31-34z" fill="#8FE0BE"/><path d="M35 13 12 39" fill="none"/><path d="M31 13a13 13 0 0 1-9 9M35 21a13 13 0 0 1-10 10" fill="none"/></g><path d="M10 41 4 47" stroke="#3A3230" stroke-width="2.6" stroke-linecap="round"/></svg>`;

function fxEl(cls, x, y) {
  const e = document.createElement('div');
  e.className = cls;
  if (x != null) { e.style.left = x + 'px'; e.style.top = y + 'px'; }
  stage.appendChild(e);
  return e;
}
/* 도구마다 다른 손동작 연출을 스테이지에 잠깐 띄운다 */
function spawnToolFx(fx, x, y) {
  if (fx === 'glove') {                    // 때리기 — 글러브가 옆에서 날아와 강타
    const left = x < stage.clientWidth / 2;
    const g = fxEl('fx-glove ' + (left ? 'fx-glove--left' : 'fx-glove--right'), x, y);
    g.innerHTML = GLOVE_SVG;
    setTimeout(() => g.remove(), 440);
    const ring = fxEl('fx-ring', x, y);
    setTimeout(() => ring.remove(), 420);
  } else if (fx === 'pinch') {             // 꼬집기 — 잡은 곳이 쭉 늘어났다 튕김
    const p = fxEl('fx-pinch', x, y);
    p.innerHTML = '<i></i>';
    setTimeout(() => p.remove(), 480);
  } else if (fx === 'squish') {            // 볼 짜부 — 양손이 볼을 압착
    const s = fxEl('fx-squish');
    s.innerHTML = `<span class="hand hand--l">${HAND_SVG}</span><span class="hand hand--r">${HAND_SVG}</span>`;
    setTimeout(() => s.remove(), 520);
  } else if (fx === 'tickle') {            // 간지럽히기 — 깃털이 살랑
    const f = fxEl('fx-feather', x, y);
    f.innerHTML = FEATHER_SVG;
    setTimeout(() => f.remove(), 520);
  } else if (fx === 'grab') {              // 붙잡기 — 손이 쑥 들어와 낚아챔
    const h = fxEl('fx-grabhand', x, y);
    h.innerHTML = HAND_SVG;
    setTimeout(() => h.remove(), 460);
  }
}

/* 데미지 & 카운트 */
function addRelief(n) {
  state.stress = Math.max(0, state.stress - n);
  renderHUD();
  if (state.stress <= 0 && !state.cleared) finishClear();
}
let rankT = null;
function renderRankingThrottled() {
  clearTimeout(rankT);
  rankT = setTimeout(() => { renderRanking(); renderHero(); }, 400);
}
function countHit() {
  state.hits++;
  state.combo++;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  if (state.bestCombo > store.bestCombo) { store.bestCombo = state.bestCombo; }
  store.totalHits++;
  bump(state.selected.id, 'hits');
  clearTimeout(state.comboTimer);
  state.comboTimer = setTimeout(() => { state.combo = 0; comboEl.classList.remove('is-show'); }, 1200);
  if (state.combo >= 2) {
    comboEl.textContent = state.combo + ' COMBO!';
    comboEl.classList.add('is-show');
    comboEl.classList.remove('is-pop');
    void comboEl.offsetWidth;
    comboEl.classList.add('is-pop');
  }
  renderHUD();
  renderMyStats();
  renderRankingThrottled();
}

/* 첫 타격에 유튜브 자동 재생 시작 */
function ensureMusic() {
  if (state.musicStarted) return;
  state.musicStarted = true;
  const src = ytFrame.getAttribute('src');
  if (src && !src.includes('autoplay=1')) {
    ytFrame.src = src + (src.includes('?') ? '&' : '?') + 'autoplay=1';
  }
}

/* 한 대 맞았을 때 — 데미지는 power [min,max] 범위에서 랜덤 */
function landHit(tool, x, y) {
  ensureMusic();
  const dmg = tool.power[0] + Math.floor(Math.random() * (tool.power[1] - tool.power[0] + 1));
  charBox.classList.remove(...ALL_ANIMS);
  void charBox.offsetWidth;
  charBox.classList.add(rand(tool.anims));
  flashFace(tool.face);
  spawnToolFx(tool.fx, x, y);
  spawnParticle(x, y, rand(tool.words));
  spawnParticle(x + rnd(-46, 46), y + rnd(-36, 6), rand(STARS), true);
  if (dmg > 0) spawnParticle(x + rnd(-14, 14), y - 46, '+' + dmg, false, 'pc-3');
  if (tool.shake) {
    shakeStage(); hitFlash();
    spawnParticle(x + rnd(-70, 70), y + rnd(-60, -14), rand(tool.words));
  }
  addRelief(dmg);
  countHit();
  maybeGroggy();
}

/* 빗나감 — 캐릭터가 약올린다 */
const TAUNTS = ['피했지롱~', '메롱 😝', '못 맞췄지롱!', '어이쿠, 헛손질~', '여긴 빈 곳인데요?'];
function tauntMiss(x, y) {
  spawnParticle(x, y, '헛방!', false, 'pc-miss');
  bubble(rand(TAUNTS), 1300);
  charBox.classList.remove(...ALL_ANIMS);
  void charBox.offsetWidth;
  charBox.classList.add('anim-dodge');
}

/* 공격 진입점 (클릭/탭/스페이스) — onChar: 캐릭터를 직접 눌렀는지 */
function attack(x, y, onChar) {
  if (!modal.hidden || state.cleared || !clearOverlay.hidden || !escapeOverlay.hidden) return;
  markInput();
  if (state.groggy) {  // 그로기 3초간은 공격 불가 — 잠깐 쉬어 가기
    spawnParticle(x, y, rand(['해롱해롱…', '지금은 못 때려!', '잠깐만 쉬는 중…']), false, 'pc-miss');
    return;
  }
  if (state.escaping) {  // 도망 중엔 5번(붙잡기)으로 캐릭터를 직접 잡아야 함
    if (state.tool === 'grab' && onChar) catchChar(x, y);
    else if (state.tool === 'grab') spawnParticle(x, y, '놓쳤다!', false, 'pc-miss');
    else { spawnParticle(x, y, '빗나감!', false, 'pc-miss'); bubble('5번으로 잡아야지~', 1200); }
    return;
  }
  if (!onChar) { tauntMiss(x, y); return; }  // 캐릭터를 눌러야만 데미지
  if (state.tool === 'grab') {               // 붙잡기는 포획 전용 — 데미지 없음
    charBox.classList.remove(...ALL_ANIMS);
    void charBox.offsetWidth;
    charBox.classList.add('anim-grab');
    spawnToolFx('grab', x, y);
    spawnParticle(x, y, rand(TOOLS.grab.words));
    bubble('지금은 안 도망가는데…?', 1200);
    return;
  }
  landHit(TOOLS[state.tool], x, y);
}

/* 스페이스: 캐릭터 현재 위치를 자동 조준 */
function attackAtChar() {
  const r = stage.getBoundingClientRect();
  const cr = charBox.getBoundingClientRect();
  attack(cr.left - r.left + cr.width / 2 + rnd(-18, 18),
         cr.top - r.top + cr.height * 0.42 + rnd(-12, 12), true);
}

stage.addEventListener('pointerdown', e => {
  if (!clearOverlay.hidden || !escapeOverlay.hidden) return;
  if (e.target.closest && e.target.closest('.fs-btn')) return;  // 전체화면 버튼은 타격 아님
  const r = stage.getBoundingClientRect();
  const onChar = !!(e.target.closest && e.target.closest('.char'));
  attack(e.clientX - r.left, e.clientY - r.top, onChar);
});

/* ---------- 도망 & 붙잡아 오기 ----------
   뒤돌아서(뒷모습) 15초 동안 무대를 뛰어다니고,
   그 안에 5번(붙잡기)으로 캐릭터를 직접 클릭해야 잡힌다.
   못 잡으면 "(이름)이 도망갔습니다" 오버레이 → 다시 시작. */
const ESCAPE_MS = 15000;
const escapeTag = $('#escapeTag');

function scheduleEscape() {
  clearTimeout(state.escTimer);
  state.escTimer = setTimeout(tryEscape, rnd(11000, 22000));
}
function stopEscapeTimers() {
  clearTimeout(state.escFailT);
  clearInterval(state.escHopT);
  clearInterval(state.escCntT);
}
function tryEscape() {
  if (state.cleared || state.groggy || state.escaping || !modal.hidden) { scheduleEscape(); return; }
  state.escaping = true;
  charMove.classList.add('escaping');
  setFace('back');                                    // 뒤돌기
  bubble(rand(['튀어야겠다!', '도망이다!', '여기서 탈출!']));
  const hop = () => {                                 // 멀어지며(작아지며) 이리저리 도망
    charMove.style.setProperty('--tx', (rnd(-1, 1) * (stage.clientWidth / 2 - 110)) + 'px');
    charMove.style.setProperty('--ty', rnd(-95, -25) + 'px');
    charMove.style.setProperty('--sc', rnd(0.62, 0.78).toFixed(2));
  };
  hop();
  state.escHopT = setInterval(hop, 950);
  let remain = ESCAPE_MS / 1000;
  escapeTag.textContent = `도망 중! ${remain}초 안에 5번으로 붙잡기`;
  escapeTag.hidden = false;
  state.escCntT = setInterval(() => {
    remain--;
    if (remain > 0) escapeTag.textContent = `도망 중! ${remain}초 안에 5번으로 붙잡기`;
  }, 1000);
  state.escFailT = setTimeout(escaped, ESCAPE_MS);
}
function endEscape(cls) {
  stopEscapeTimers();
  state.escaping = false;
  charMove.classList.remove('escaping');
  charMove.classList.add(cls);
  charMove.style.setProperty('--tx', '0px');
  charMove.style.setProperty('--ty', '0px');
  charMove.style.setProperty('--sc', '1');
  escapeTag.hidden = true;
  if (!state.cleared) setFace('normal');
  setTimeout(() => charMove.classList.remove(cls), 700);
  scheduleEscape();
}
function escaped() {                                   // 15초 경과 — 도망 성공
  endEscape('walk-return');
  $('#escName').textContent = `${state.name} ${state.selected.role}`;
  escapeOverlay.hidden = false;
}
function catchChar(x, y) {                             // 포획 — 데미지 없음
  endEscape('grab-return');
  bubble('잡혔다…! 🥲');
  flashFace('shock', 800);
  spawnParticle(x, y, '포획 성공!');
  store.grabs++;
  saveStore();
  renderMyStats();
}

/* ---------- 그로기 (해소율 50% 이상에서 랜덤 발동) ----------
   완전 해소(100%) 전, 50% 이상 구간에서 낮은 확률로 발동.
   3초 동안 해롱해롱하며 이 시간에는 공격이 통하지 않는다(강제 휴식). */
function maybeGroggy() {
  const relief = Math.round((1 - state.stress / STRESS_MAX) * 100);
  const cooled = Date.now() - state.lastGroggy > 20000;   // 최소 20초 간격
  if (relief >= 50 && relief < 100 && !state.groggy && !state.escaping && cooled && Math.random() < 0.04) {
    state.lastGroggy = Date.now();
    state.groggy = true;
    clearTimeout(state.escTimer);           // 그로기 중 도망 예약 중단
    charMove.classList.add('groggy');
    setFace('dizzy');
    bubble('해롱해롱…', 2800);
    $('#groggyTag').hidden = false;
    spawnParticle(stage.clientWidth / 2, 96, 'GROGGY! 3초간 공격 불가', false, 'pc-4');
    setTimeout(() => {
      state.groggy = false;
      charMove.classList.remove('groggy');
      $('#groggyTag').hidden = true;
      if (!state.cleared) setFace('normal');
      scheduleEscape();
    }, 3000);
  }
}

/* ---------- 물 바가지 (Enter / 버튼, 쿨타임) ---------- */
const waterCool = $('#waterCool');
function splashWater() {
  if (!modal.hidden || state.cleared) return;
  if (state.groggy) {  // 그로기 중엔 물벼락도 잠깐 멈춤
    spawnParticle(stage.clientWidth / 2, 90, '해롱해롱… 잠깐만!', false, 'pc-miss');
    return;
  }
  markInput();
  const now = Date.now();
  if (now < state.waterReady) {
    spawnParticle(stage.clientWidth / 2, 90, `물 받는 중… ${Math.ceil((state.waterReady - now) / 1000)}초`, false, 'pc-miss');
    return;
  }
  state.waterReady = now + WATER.cooldownMs;
  const btn = $('#waterBtn');
  btn.classList.add('cooling');
  waterCool.style.transition = 'none';
  waterCool.style.width = '100%';
  requestAnimationFrame(() => {
    waterCool.style.transition = `width ${WATER.cooldownMs}ms linear`;
    waterCool.style.width = '0%';
  });
  setTimeout(() => btn.classList.remove('cooling'), WATER.cooldownMs);

  const bucket = document.createElement('div');
  bucket.className = 'bucket';
  bucket.innerHTML = `<svg viewBox="0 0 24 24" class="icon">${WATER.icon}</svg>`;
  stage.appendChild(bucket);
  setTimeout(() => bucket.remove(), 1000);

  const flash = document.createElement('i');
  flash.className = 'waterflash';
  stage.appendChild(flash);
  setTimeout(() => flash.remove(), 700);

  for (let i = 0; i < 14; i++) {
    const d = document.createElement('i');
    d.className = 'drop';
    d.style.left = (stage.clientWidth / 2 + rnd(-130, 130)) + 'px';
    d.style.animationDelay = rnd(0, 260) + 'ms';
    stage.appendChild(d);
    setTimeout(() => d.remove(), 1100);
  }

  flashFace('shock', 900);
  charBox.classList.add('soaked');
  setTimeout(() => charBox.classList.remove('soaked'), 900);
  spawnParticle(stage.clientWidth / 2, stage.clientHeight * 0.3, rand(WATER.words), false, 'pc-2');
  store.waters++;
  saveStore();
  addRelief(WATER.power);
  countHit();
}

/* ---------- 완전 해소 ---------- */
function finishClear() {
  state.cleared = true;
  state.groggy = false;
  state.escaping = false;
  clearTimeout(state.escTimer);
  stopEscapeTimers();
  charMove.classList.remove('groggy', 'escaping');
  charMove.style.setProperty('--tx', '0px');
  charMove.style.setProperty('--ty', '0px');
  charMove.style.setProperty('--sc', '1');
  $('#groggyTag').hidden = true;
  escapeTag.hidden = true;
  setFace('swollen');                               // 퉁퉁 부은 얼굴
  store.totalClears++;
  bump(state.selected.id, 'clears');
  const who = `${state.name} ${state.selected.role}`;
  $('#clearName').textContent = who;
  $('#clearAskName').textContent = who;
  $('#clearChar').innerHTML = charSVG(state.selected, 'swollen');
  $('#clearAsk').hidden = false;                    // 1단계: "스트레스 좀 풀렸어?"
  $('#clearDone').hidden = true;
  setTimeout(() => {
    if (!state.cleared) return;   // 표시 전에 리셋됐으면 오버레이 띄우지 않음
    clearOverlay.hidden = false;
    renderMyStats();
    renderRanking();
    renderHero();
  }, 350);
}
function dropConfetti() {
  const colors = ['#4A154B', '#1264A3', '#2EB67D', '#ECB22E'];
  for (let i = 0; i < 44; i++) {
    const c = document.createElement('i');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + '%';
    c.style.background = colors[i % colors.length];
    c.style.animationDuration = rnd(1.4, 2.8) + 's';
    c.style.animationDelay = rnd(0, 0.5) + 's';
    stage.appendChild(c);
    setTimeout(() => c.remove(), 3400);
  }
}

/* ---------- 키보드: 1~5 도구, Space 공격, Enter 물 (꾹 누름 금지) ---------- */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modal.hidden) { closeCardModal(); return; }
  const tag = document.activeElement && document.activeElement.tagName;
  if (!modal.hidden || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
  if (e.repeat) {  // 키 반복(꾹 누르기) 금지
    if (e.code === 'Space' || e.key === 'Enter') e.preventDefault();
    return;
  }
  const entry = Object.entries(TOOLS).find(([, t]) => t.key === e.key);
  if (entry) { selectTool(entry[0]); markInput(); return; }
  if (e.code === 'Space') { e.preventDefault(); attackAtChar(); }
  else if (e.key === 'Enter') { e.preventDefault(); splashWater(); }
});

/* ---------- 커스텀 도구 커서 ---------- */
stage.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;
  stage.classList.add('has-cursor');
  const r = stage.getBoundingClientRect();
  toolCursor.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`;
});
stage.addEventListener('pointerleave', () => stage.classList.remove('has-cursor'));

/* ---------- 방치 시 스트레스 회복 (design-spec: 입력 3초 없으면 회복) ---------- */
setInterval(() => {
  const idle = Date.now() - state.lastInput > 3000;
  const active = idle && !state.cleared && !state.groggy && !state.escaping && state.stress < 100;
  $('#regenTag').hidden = !active;
  if (!active) { state.regenAcc = 0; return; }
  state.regenAcc += 500;
  if (state.regenAcc >= 1500) {
    state.regenAcc = 0;
    state.stress = Math.min(STRESS_MAX, state.stress + 3);  // 방치 시 천천히 회복
    renderHUD();
  }
}, 500);

/* HUD·오버레이 버튼들 */
$('#againBtn').addEventListener('click', e => { e.stopPropagation(); resetGame(); renderSmash(); });
$('#resetBtn').addEventListener('click', () => { resetGame(); renderSmash(); });
$('#renameBtn').addEventListener('click', () => openCardModal(state.selected));
$('#clearNo').addEventListener('click', e => { e.stopPropagation(); resetGame(); renderSmash(); });   // "아니, 아직!" → 한 판 더
$('#clearYes').addEventListener('click', e => {                                                       // "응, 시원해" → 축하 화면
  e.stopPropagation();
  $('#clearAsk').hidden = true;
  $('#clearDone').hidden = false;
  dropConfetti();
});
$('#escRetry').addEventListener('click', e => { e.stopPropagation(); resetGame(); renderSmash(); });  // 도망 후 다시 데려오기
$('#escPick').addEventListener('click', () => { resetGame(); renderSmash(); });

/* 전체화면 토글 */
$('#fsBtn').addEventListener('click', e => {
  e.stopPropagation();
  const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
  if (fsEl) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  else (stage.requestFullscreen || stage.webkitRequestFullscreen).call(stage);
});

/* ============================================================
   ⑤ 실집계 랭킹 (이 기기 localStorage 기준)
   ============================================================ */
const rankList = $('#rankList');
const byId = Object.fromEntries(CHARACTERS.map(c => [c.id, c]));
/* 전역 랭킹이 켜져 있으면 기본은 전국 통합, 아니면 이 기기 */
let rankMode = Ranking.enabled() ? 'global' : 'local';

function paintRows(rows) {  // rows: [{ c, hits, clears }]
  rows = rows.filter(r => r.c && r.hits > 0).slice(0, 10);
  if (!rows.length) {
    rankList.innerHTML = `<li class="rank-empty">아직 기록이 없어요 — 해소존에서 첫 타격을 날려보세요!</li>`;
    return;
  }
  const max = rows[0].hits;
  rankList.innerHTML = rows.map((r, i) => `
    <li class="rank-row ${i < 3 ? 'rank-row--top' : ''}">
      <b class="rank-no rank-no--${i + 1}">${i + 1}</b>
      <span class="rank-face">${charSVG(r.c)}</span>
      <span class="rank-name">${r.c.name}${r.clears ? ` <em class="rank-clear">완전 해소 ${fmt(r.clears)}회</em>` : ''}</span>
      <span class="rank-bar"><i style="width:${Math.max(6, r.hits / max * 100)}%"></i></span>
      <b class="rank-hits">${fmt(r.hits)}</b>
    </li>`).join('');
}

function localRows() {
  return CHARACTERS
    .map(c => ({ c, hits: charHits(c.id), clears: (store.perChar[c.id] || {}).clears || 0 }))
    .sort((a, b) => b.hits - a.hits);
}

let globalReqId = 0;
function renderRanking() {
  if (rankMode === 'global' && Ranking.enabled()) {
    const reqId = ++globalReqId;
    rankList.classList.add('is-loading');
    Ranking.fetchTop(12)
      .then(data => {
        if (reqId !== globalReqId) return;             // 최신 요청만 반영
        rankList.classList.remove('is-loading');
        paintRows((data || []).map(r => ({ c: byId[r.char_id], hits: r.hits, clears: r.clears })));
      })
      .catch(() => {
        if (reqId !== globalReqId) return;
        rankList.classList.remove('is-loading');
        rankList.innerHTML = `<li class="rank-empty">전국 랭킹을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</li>`;
      });
  } else {
    paintRows(localRows());
  }
}

/* 전국/이 기기 토글 (백엔드 설정 시에만 노출) */
if (Ranking.enabled()) {
  const toggle = $('#rankToggle');
  toggle.hidden = false;
  toggle.addEventListener('click', e => {
    const btn = e.target.closest('[data-mode]');
    if (!btn) return;
    rankMode = btn.dataset.mode;
    $$('button', toggle).forEach(b => b.classList.toggle('is-on', b === btn));
    $('#rankNote').textContent = rankMode === 'global'
      ? '전국의 모든 뿌셔러가 함께 만든 통합 집계예요. 누가 제일 많이 맞았을까요?'
      : '이 기기(브라우저)에 저장된 내 기록이에요.';
    renderRanking();
  });
}
function renderMyStats() {
  $('#msHits').textContent = fmt(store.totalHits);
  $('#msClears').textContent = fmt(store.totalClears);
  $('#msCombo').textContent = store.bestCombo;
  $('#msWaters').textContent = fmt(store.waters);
  $('#msGrabs').textContent = fmt(store.grabs);
}
function renderHero() {
  $('#heroHits').textContent = fmt(store.totalHits);
  $('#heroClears').textContent = fmt(store.totalClears);
  const top = CHARACTERS.map(c => ({ c, hits: charHits(c.id) })).sort((a, b) => b.hits - a.hits)[0];
  $('#heroTop').textContent = top && top.hits > 0 ? top.c.name : '아직 없음';
}

/* ============================================================
   ⑥ 플레이리스트 — PULSE ORIGIN 69% 우선 랜덤 재생
   ============================================================ */
const ytFrame = $('#ytFrame');
const ytInput = $('#ytInput');
const ytError = $('#ytError');

function parseYouTube(url) {
  try {
    const u = new URL(url.trim());
    if (!/(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(u.hostname)) return null;
    const list = u.searchParams.get('list');
    if (list) return { type: 'list', id: list };
    if (u.hostname.includes('youtu.be')) return { type: 'video', id: u.pathname.slice(1).split('/')[0] };
    if (u.pathname === '/watch') return { type: 'video', id: u.searchParams.get('v') };
    const m = u.pathname.match(/^\/(embed|shorts|live)\/([\w-]{6,})/);
    if (m) return { type: 'video', id: m[2] };
  } catch (_) { /* URL 형식 아님 */ }
  return null;
}
function markActiveChip(id) {
  $$('.preset').forEach(p => p.classList.toggle('is-on', p.dataset.id === id));
}
function playTrack(t, source) {
  const auto = state.musicStarted ? '&autoplay=1' : '';
  ytFrame.src = `https://www.youtube.com/embed/${t.id}?rel=0${auto}`;
  ytError.hidden = true;
  $('#nowPlaying').innerHTML = `지금 재생 · <b>${t.label}</b>` +
    (source === 'pulse' ? ' <span class="np-badge">PULSE ORIGIN</span>' : '');
  markActiveChip(t.id);
}
/* 자동/셔플: 69% 확률로 PULSE ORIGIN 우선 */
function shufflePlay() {
  const usePulse = Math.random() < 0.69;
  const pool = usePulse ? PULSE_TRACKS : MUSIC_POOL;
  playTrack(rand(pool), usePulse ? 'pulse' : 'pool');
}
function playCustom(url) {
  const parsed = parseYouTube(url);
  if (!parsed || !parsed.id) { ytError.hidden = false; return false; }
  ytError.hidden = true;
  state.musicStarted = true;   // 사용자가 직접 재생 — 이후 자동재생 유지
  ytFrame.src = parsed.type === 'list'
    ? `https://www.youtube.com/embed/videoseries?list=${parsed.id}&rel=0&autoplay=1`
    : `https://www.youtube.com/embed/${parsed.id}?rel=0&autoplay=1`;
  $('#nowPlaying').innerHTML = '지금 재생 · <b>내가 붙여넣은 링크</b>';
  markActiveChip('');
  return true;
}
$('#ytBtn').addEventListener('click', () => playCustom(ytInput.value));
ytInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.stopPropagation(); playCustom(ytInput.value); } });
$('#shuffleBtn').addEventListener('click', () => { state.musicStarted = true; shufflePlay(); });

const musicIcon = '<svg class="icon" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
$('#ytPresets').innerHTML = PULSE_TRACKS.map(t =>
  `<button class="preset" data-id="${t.id}">${musicIcon}${t.label}</button>`).join('');
document.addEventListener('click', e => {
  const chip = e.target.closest('.preset[data-id]');
  if (!chip) return;
  const t = [...PULSE_TRACKS, ...MUSIC_POOL].find(x => x.id === chip.dataset.id);
  if (t) { state.musicStarted = true; playTrack(t, PULSE_TRACKS.includes(t) ? 'pulse' : 'pool'); }
});

/* ============================================================
   초기 렌더
   ============================================================ */
$('#heroArt').insertAdjacentHTML('afterbegin', charSVG(CHARACTERS[0]));
renderGrid();
renderSmash();
renderRanking();
renderMyStats();
renderHero();
shufflePlay();
scheduleEscape();

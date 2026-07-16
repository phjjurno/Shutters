/* ============================================================
   서트레스 SHUTRESS — 데이터
   캐릭터(두두 베이스) / 도구 / 칭호 / 플레이리스트
   캐릭터 디자인은 design/ 폴더의 두두(DUDU) 스타터 키트 기반:
   봉제인형 비율, 색상 베리에이션, 피격 스쿼시 수치를 따른다.
   ============================================================ */

/* 두두 색상 베리에이션 (design/character-config.json + 디자인 시트) */
const DUDU_COLORS = {
  tan:    ['#E7BF8B', '#A87848'],
  gray:   ['#D9D9D9', '#8E8E8E'],
  brown:  ['#C89A66', '#7C5836'],
  black:  ['#6B615C', '#332E2B'],
  pink:   ['#F2B7BD', '#C97F8B'],
  rose:   ['#F4A9B0', '#BF6B77'],
  blue:   ['#A9C4E0', '#5F82A8'],
  teal:   ['#9FD0D8', '#5A98A3'],
  green:  ['#B5D3A2', '#6E9260'],
  slate:  ['#BFC6CC', '#7A868F'],
  mocha:  ['#D3A276', '#8A6238'],
  coal:   ['#7A7370', '#3A3532']
};

/* 캐릭터별 액세서리 SVG (두두 좌표계 512x540, 머리 중심 256,180 r128) */
const ACCESSORIES = {
  professor: `
    <g class="acc"><circle cx="213" cy="175" r="36" fill="rgba(255,255,255,.28)"/><circle cx="299" cy="175" r="36" fill="rgba(255,255,255,.28)"/><path d="M249 175 h14 M177 173 h-26 M335 173 h26"/></g>
    <path d="M256 16 L368 50 L256 84 L144 50 Z" fill="#3A3230"/>
    <path d="M352 58 v44" stroke="#ECB22E" stroke-width="9" stroke-linecap="round" fill="none"/><circle cx="352" cy="112" r="10" fill="#ECB22E"/>`,
  ta: `
    <g class="acc"><rect x="177" y="151" width="72" height="46" rx="10" fill="rgba(255,255,255,.28)"/><rect x="263" y="151" width="72" height="46" rx="10" fill="rgba(255,255,255,.28)"/><path d="M249 172 h14 M177 170 h-24 M335 170 h24"/></g>
    <g transform="rotate(-8 343 347)"><rect x="300" y="316" width="86" height="62" rx="6" fill="#FFF" stroke="#3A3230" stroke-width="7"/><path d="M316 334 h52 M316 350 h52 M316 366 h34" stroke="#B9B2AC" stroke-width="6" stroke-linecap="round" fill="none"/></g>`,
  teammate: `
    <path d="M136 142 A122 122 0 0 1 376 142 Z" fill="#ECB22E" stroke="#3A3230" stroke-width="8"/>
    <rect x="230" y="124" width="52" height="22" rx="11" fill="#D89E1B" stroke="#3A3230" stroke-width="6"/>
    <g transform="rotate(-10 354 356)"><rect x="330" y="316" width="48" height="80" rx="10" fill="#3A3230"/><rect x="340" y="330" width="28" height="44" rx="4" fill="#8FB7E8"/></g>`,
  boss: `
    <path d="M150 126 Q186 56 306 68 Q352 76 364 118 Q300 92 242 98 Q184 104 150 126 Z" fill="#1D1C1D"/>
    <path d="M214 286 L256 320 L298 286 L256 296 Z" fill="#FFF" stroke="#3A3230" stroke-width="6"/>
    <path d="M256 312 l24 26 -24 82 -24 -82 z" fill="#1264A3" stroke="#3A3230" stroke-width="6"/>`,
  kkondae: `
    <rect x="170" y="150" width="78" height="46" rx="18" fill="#1D1C1D"/><rect x="264" y="150" width="78" height="46" rx="18" fill="#1D1C1D"/>
    <g class="acc"><path d="M248 168 h16 M170 166 h-22 M342 166 h22"/></g>
    <rect x="336" y="322" width="52" height="58" rx="9" fill="#FFF" stroke="#3A3230" stroke-width="7"/>
    <g class="acc"><path d="M388 336 q24 8 0 28"/><path d="M352 306 q7 -12 0 -22 M370 306 q7 -12 0 -22"/></g>`,
  client: `
    <g class="acc"><path d="M136 162 A124 124 0 0 1 376 162"/></g>
    <rect x="118" y="148" width="36" height="60" rx="15" fill="#3A3230"/><rect x="358" y="148" width="36" height="60" rx="15" fill="#3A3230"/>
    <g class="acc"><path d="M138 206 q-6 46 62 48 q22 1 28 -12"/></g><circle cx="230" cy="242" r="11" fill="#3A3230"/>`,
  customer: `
    <g class="acc" stroke="#ECB22E"><path d="M96 100 q16 -18 0 -34 q-14 -15 2 -30"/><path d="M416 100 q-16 -18 0 -34 q14 -15 -2 -30"/></g>
    <g transform="rotate(10 150 364)"><path d="M118 322 h64 v84 l-10 -8 -11 8 -11 -8 -11 8 -11 -8 -10 8 z" fill="#FFF" stroke="#3A3230" stroke-width="6"/><path d="M132 344 h36 M132 360 h36 M132 376 h22" stroke="#B9B2AC" stroke-width="6" stroke-linecap="round" fill="none"/></g>`,
  noshow: `
    <path d="M136 142 A122 122 0 0 1 376 142 Z" fill="#2EB67D" stroke="#3A3230" stroke-width="8"/>
    <path d="M354 128 q66 4 56 28 q-8 16 -62 8" fill="#249668" stroke="#3A3230" stroke-width="7"/>
    <rect x="214" y="300" width="84" height="70" rx="10" fill="#FFF" stroke="#3A3230" stroke-width="7"/>
    <path d="M214 322 h84" stroke="#3A3230" stroke-width="6"/>
    <path d="M238 336 l36 24 M274 336 l-36 24" stroke="#E04E4E" stroke-width="9" stroke-linecap="round"/>`,
  reviewer: `
    <g class="acc"><circle cx="368" cy="330" r="34" fill="rgba(255,255,255,.3)"/><path d="M392 356 l30 30" stroke-width="14"/></g>
    <rect x="198" y="300" width="114" height="56" rx="12" fill="#FFF" stroke="#3A3230" stroke-width="7"/>
    <path d="M224 312 l7 14 15 2 -11 11 3 15 -14 -8 -14 8 3 -15 -11 -11 15 -2 z" fill="#ECB22E"/>
    <path d="M258 326 h40 M258 342 h28" stroke="#B9B2AC" stroke-width="7" stroke-linecap="round" fill="none"/>`,
  neighbor: `
    <path class="acc" d="M134 158 A124 124 0 0 1 378 158" stroke-width="16"/>
    <rect x="106" y="148" width="46" height="74" rx="19" fill="#4A154B" stroke="#3A3230" stroke-width="7"/>
    <rect x="360" y="148" width="46" height="74" rx="19" fill="#4A154B" stroke="#3A3230" stroke-width="7"/>
    <g class="acc" stroke="#ECB22E"><path d="M96 262 q-18 10 -8 28 M416 262 q18 10 8 28"/></g>`,
  hater: `
    <path class="acc" d="M120 196 A140 140 0 0 1 392 196" stroke="#241F1D" stroke-width="46"/>
    <path class="acc" d="M170 288 v34 M342 288 v34" stroke="#241F1D" stroke-width="12"/>
    <rect x="196" y="316" width="120" height="48" rx="10" fill="#3A3230"/>
    <path d="M212 332 h12 M234 332 h12 M256 332 h12 M278 332 h12 M212 348 h34 M256 348 h34" stroke="#8A8A8A" stroke-width="7" stroke-linecap="round" fill="none"/>`,
  driver: `
    <path d="M136 142 A122 122 0 0 1 376 142 Z" fill="#3A3230"/><ellipse cx="256" cy="142" rx="126" ry="17" fill="#241F1D"/>
    <g class="acc" stroke-width="14"><circle cx="256" cy="362" r="54"/><path d="M256 374 v40 M214 350 l-34 -20 M298 350 l34 -20"/></g>
    <circle cx="256" cy="362" r="13" fill="#3A3230"/>`,
  /* ── 추가 캐릭터 액세서리 ── */
  senior: `
    <path d="M140 152 A116 116 0 0 1 372 152 Z" fill="#2EB67D" stroke="#3A3230" stroke-width="8"/>
    <path d="M140 152 q116 -42 232 0" fill="none" stroke="#249668" stroke-width="10"/>
    <path class="acc" d="M256 296 q-74 24 -110 -6"/>
    <rect x="130" y="280" width="42" height="32" rx="9" fill="#ECB22E" stroke="#3A3230" stroke-width="6"/><circle cx="151" cy="296" r="6" fill="#3A3230"/>`,
  examproctor: `
    <path class="acc" d="M212 66 L256 300 L300 66" stroke="#5F6C77" stroke-width="12"/>
    <rect x="220" y="296" width="72" height="48" rx="8" fill="#FFF" stroke="#3A3230" stroke-width="7"/>
    <circle cx="238" cy="315" r="9" fill="#BFC6CC"/><path d="M256 310 h26 M256 324 h18" stroke="#B9B2AC" stroke-width="5" stroke-linecap="round" fill="none"/>
    <rect x="336" y="286" width="42" height="30" rx="8" fill="#E04E4E" stroke="#3A3230" stroke-width="6"/><circle cx="358" cy="301" r="6" fill="#3A3230"/>`,
  hrfreeze: `
    <path d="M214 286 L256 314 L298 286 L256 300 Z" fill="#FFF" stroke="#3A3230" stroke-width="6"/>
    <path d="M256 310 l22 20 -22 78 -22 -78 z" fill="#5F82A8" stroke="#3A3230" stroke-width="6"/>
    <g class="acc"><path d="M150 150 q40 -18 78 -2 M362 150 q-40 -18 -78 -2"/></g>`,
  meetingking: `
    <path class="acc" d="M150 178 A108 108 0 0 1 362 178" stroke-width="14"/>
    <rect x="130" y="168" width="30" height="54" rx="14" fill="#3A3230"/>
    <rect x="352" y="168" width="30" height="54" rx="14" fill="#3A3230"/>
    <path class="acc" d="M150 214 q-22 28 12 50"/><circle cx="176" cy="266" r="13" fill="#3A3230"/>`,
  haggler: `
    <circle cx="350" cy="326" r="32" fill="#ECB22E" stroke="#3A3230" stroke-width="7"/>
    <path d="M350 308 v36 M340 318 h20 M340 332 h20" stroke="#3A3230" stroke-width="5" stroke-linecap="round" fill="none"/>
    <g class="acc"><path d="M150 152 q40 18 78 4 M362 152 q-40 18 -78 4"/></g>`,
  phonerager: `
    <g transform="rotate(20 356 214)"><rect x="336" y="150" width="42" height="150" rx="21" fill="#3A3230"/><rect x="345" y="168" width="24" height="46" rx="8" fill="#E7A6AE"/><rect x="345" y="238" width="24" height="46" rx="8" fill="#E7A6AE"/></g>
    <g class="acc" stroke="#E04E4E"><path d="M150 150 q40 -16 78 -2"/></g>`,
  spamcaller: `
    <g transform="rotate(-16 150 214)"><rect x="128" y="150" width="46" height="150" rx="12" fill="#3A3230"/><rect x="136" y="166" width="30" height="104" rx="5" fill="#E04E4E"/><circle cx="151" cy="286" r="6" fill="#8A8A8A"/></g>
    <g class="acc" stroke="#E04E4E"><path d="M120 120 q-16 22 0 48"/><path d="M100 100 q-28 38 0 88"/></g>`,
  linecutter: `
    <path d="M150 150 A112 112 0 0 1 374 150 Z" fill="#F2B7BD" stroke="#3A3230" stroke-width="8"/>
    <path d="M360 150 q62 2 54 30 q-12 16 -62 4" fill="#D98E9A" stroke="#3A3230" stroke-width="7"/>
    <path class="acc" d="M118 300 h96" stroke="#E04E4E" stroke-width="12"/>
    <path d="M214 282 l30 18 -30 18" fill="none" stroke="#E04E4E" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`
};

/* 스트레스 유발자 — 카테고리별 3명씩 12명 */
const CHARACTERS = [
  /* 학교 */
  { id: 'professor', name: '교수님', role: '교수님', group: 'school', groupLabel: '학교', color: 'tan',
    desc: '금요일 밤 11시에 과제 공지, 시험 범위는 "지금까지 배운 전부".',
    quote: '“출석은 학생의 기본 아닌가요?”',
    tags: ['과제', '시험', '학점', '출석', '수업'], defaultName: '김뿌셔' },
  { id: 'ta', name: '조교님', role: '조교님', group: 'school', groupLabel: '학교', color: 'gray',
    desc: '제출 1분 늦으면 0점 처리, 질문 메일엔 3주째 무응답.',
    quote: '“공지 안 읽으셨어요?”',
    tags: ['조교', '제출', '0점', '메일', '공지'], defaultName: '칼차감' },
  { id: 'teammate', name: '팀플 빌런', role: '팀원님', group: 'school', groupLabel: '학교', color: 'blue',
    desc: '단톡 읽씹 전문, 발표 전날 잠수 타고 발표 당일 나타나는 그분.',
    quote: '“미안, 나 그날 바빠서ㅠ”',
    tags: ['팀플', '읽씹', '잠수', '무임승차', '조별과제'], defaultName: '나잠수' },
  { id: 'senior', name: '학과 선배', role: '선배님', group: 'school', groupLabel: '학교', color: 'green',
    desc: '동아리 강제 소집, 밥 사주며 잔소리 풀코스 서비스.',
    quote: '“야, 후배가 돼가지고~”',
    tags: ['선배', '동아리', '군기', '뒤풀이', '잔소리'], defaultName: '군기왕' },
  { id: 'examproctor', name: '시험 감독', role: '감독관님', group: 'school', groupLabel: '학교', color: 'slate',
    desc: '시작 3초 전 휴대폰 제출, 화장실도 따라올 기세.',
    quote: '“부정행위로 처리하겠습니다.”',
    tags: ['시험', '감독', '컨닝', '감시', '고사장'], defaultName: '매의눈' },
  /* 직장 */
  { id: 'boss', name: '직장 상사', role: '부장님', group: 'work', groupLabel: '직장', color: 'black',
    desc: '퇴근 5분 전 업무 폭탄 투하, 주말엔 카톡으로 안부(라 쓰고 업무) 확인.',
    quote: '“이거 오늘까지 되지?”',
    tags: ['야근', '회의', '보고서', '카톡', '퇴근'], defaultName: '박부장' },
  { id: 'kkondae', name: '꼰대 선배', role: '선배님', group: 'work', groupLabel: '직장', color: 'brown',
    desc: '라떼 제조 장인. 조언을 가장한 잔소리 자판기, 회식은 필참.',
    quote: '“나 때는 말이야…”',
    tags: ['라떼', '잔소리', '회식', '선배'], defaultName: '라떼왕' },
  { id: 'client', name: '갑질 클라이언트', role: '클라이언트님', group: 'work', groupLabel: '직장', color: 'pink',
    desc: '"심플하면서 화려하게" — 수정 요청 999번째, 시안은 어제까지.',
    quote: '“느낌 아시죠? 그 느낌이 아니에요.”',
    tags: ['수정', '시안', '갑질', '마감', '디자인'], defaultName: '왕갑질' },
  { id: 'hrfreeze', name: '인사팀', role: '팀장님', group: 'work', groupLabel: '직장', color: 'blue',
    desc: '성과는 네 덕, 연봉은 동결. 평가 시즌만 갑자기 다정해짐.',
    quote: '“올해는 회사가 좀 어려워서…”',
    tags: ['연봉', '인사', '평가', '동결', '고과'], defaultName: '동결각' },
  { id: 'meetingking', name: '회의 소집왕', role: '리더님', group: 'work', groupLabel: '직장', color: 'teal',
    desc: '회의를 잡기 위한 회의를 소집하는 회의의 화신.',
    quote: '“잠깐 5분만 회의할까요?”',
    tags: ['회의', '소집', '화상', '야근', '어젠다'], defaultName: '회의왕' },
  /* 가게 */
  { id: 'customer', name: '진상 손님', role: '고객님', group: 'store', groupLabel: '가게', color: 'rose',
    desc: '영수증 없이 환불 요구, 목소리 데시벨은 무제한 요금제.',
    quote: '“사장 나오라 그래!”',
    tags: ['환불', '컴플레인', '반말', '알바'], defaultName: '왕진상' },
  { id: 'noshow', name: '노쇼 손님', role: '고객님', group: 'store', groupLabel: '가게', color: 'green',
    desc: '10인 단체 예약 후 증발. 전화는 없는 번호입니다.',
    quote: '“(연결이 되지 않아…)”',
    tags: ['노쇼', '예약', '단체', '잠수'], defaultName: '노쇼왕' },
  { id: 'reviewer', name: '리뷰 테러범', role: '리뷰어님', group: 'store', groupLabel: '가게', color: 'slate',
    desc: '음식 다 먹고 별 1개. 사유: "그냥".',
    quote: '“★☆☆☆☆ 맛있는데 기분 나빠요.”',
    tags: ['리뷰', '별점', '테러', '배달'], defaultName: '별하나' },
  { id: 'haggler', name: '흥정왕', role: '고객님', group: 'store', groupLabel: '가게', color: 'mocha',
    desc: '정찰제 매장에서 "깎아주면 살게" 시전, 최후엔 "단골 될게".',
    quote: '“이거 얼마까지 돼요?”',
    tags: ['흥정', '할인', '깎기', '단골', '덤'], defaultName: '깎아왕' },
  { id: 'phonerager', name: '전화 진상', role: '고객님', group: 'store', groupLabel: '가게', color: 'rose',
    desc: '통화 30분째, 요점은 없고 볼륨만 최대치.',
    quote: '“됐고, 그냥 사장 바꿔.”',
    tags: ['전화', '컴플레인', '고성', '진상', '녹취'], defaultName: '고성왕' },
  /* 일상 */
  { id: 'neighbor', name: '층간소음 이웃', role: '이웃님', group: 'life', groupLabel: '일상', color: 'teal',
    desc: '새벽 2시 세탁기 가동, 주말 아침엔 드릴 연주회 개최.',
    quote: '“쿵. 쿵. 쿵쿵쿵.”',
    tags: ['층간소음', '새벽', '쿵쿵', '아파트'], defaultName: '윗집맨' },
  { id: 'hater', name: '악플러', role: '악플러님', group: 'life', groupLabel: '일상', color: 'coal',
    desc: '익명 뒤에 숨은 키보드 파이터. 손가락만 살아있다.',
    quote: '“그냥 내 생각을 말한 것뿐인데?”',
    tags: ['악플', '키보드', '익명', 'SNS'], defaultName: '김익명' },
  { id: 'driver', name: '운전 빌런', role: '기사님', group: 'life', groupLabel: '일상', color: 'mocha',
    desc: '깜빡이는 장식, 칼치기는 기본 옵션, 경적은 BGM.',
    quote: '“빵——————!”',
    tags: ['깜빡이', '칼치기', '경적', '운전'], defaultName: '칼치기' },
  { id: 'spamcaller', name: '스팸 전화', role: '상담원님', group: 'life', groupLabel: '일상', color: 'gray',
    desc: '부재중 27통, 저금리 대출과 상조 서비스 안내 전문.',
    quote: '“고객님, 딱 5분만요!”',
    tags: ['스팸', '대출', '전화', '광고', '피싱'], defaultName: '27통' },
  { id: 'linecutter', name: '새치기범', role: '얌체님', group: 'life', groupLabel: '일상', color: 'pink',
    desc: '줄은 장식, 새치기는 예술. 눈 마주치면 딴청 피우기.',
    quote: '“저 원래 여기 있었는데요?”',
    tags: ['새치기', '줄서기', '얌체', '민폐', '오픈런'], defaultName: '쓱치기' }
];

/* 카테고리 필터 */
const GROUPS = [
  { id: 'all', label: '전체' },
  { id: 'school', label: '학교' },
  { id: 'work', label: '직장' },
  { id: 'store', label: '가게' },
  { id: 'life', label: '일상' }
];

/* 타격 도구 — 숫자키 1~5 로 선택, 캐릭터를 직접 클릭/스페이스로 공격
   power: [최소, 최대] — 타격마다 이 범위에서 랜덤 데미지 (차등)
   fx: 도구별 화려한 이펙트 오버레이 종류 (app.js spawnToolFx) */
const TOOLS = {
  punch: {
    key: '1', label: '때리기', power: [2, 4], hint: '해소 2~4', fx: 'glove',
    words: ['퍽!', '빡!', '쾅!', '훅!', '털썩!', '퍼버벅!'],
    anims: ['anim-punch-a', 'anim-punch-b', 'anim-punch-c'],
    face: 'ouch', shake: true,
    icon: '<rect x="6" y="8" width="12" height="10" rx="3"/><path d="M9.5 8v4M13 8v4M16.5 8v4M6 13H4.5a1.5 1.5 0 0 1 0-3H6"/>'
  },
  pinch: {
    key: '2', label: '꼬집기', power: [1, 3], hint: '해소 1~3', fx: 'pinch',
    words: ['아얏!', '꼬집!', '으악!', '앗 따가!'],
    anims: ['anim-pinch'],
    face: 'cry',
    icon: '<path d="M4 5l7 7-7 7M20 5l-7 7 7 7"/>'
  },
  tickle: {
    key: '3', label: '간지럽히기', power: [1, 2], hint: '해소 1~2', fx: 'tickle',
    words: ['간질간질~', '그만~ㅋㅋ', '아 잠깐ㅋㅋ', 'ㅋㅋㅋㅋ'],
    anims: ['anim-tickle'],
    face: 'laugh',
    icon: '<path d="M4 20C7.5 9 15 4 20 4c0 5.5-4.5 13.5-15.5 15.5"/><path d="M4 20L14.5 9.5"/>'
  },
  squish: {
    key: '4', label: '볼 짜부하기', power: [2, 3], hint: '해소 2~3', fx: 'squish',
    words: ['뀨웅…', '짜부…', '말랑말랑', '뭉개뭉개'],
    anims: ['anim-squish'],
    face: 'squish',
    icon: '<circle cx="12" cy="12" r="4.5"/><path d="M2.5 7q4 3.5 4 5t-4 5M21.5 7q-4 3.5-4 5t4 5"/>'
  },
  grab: {
    key: '5', label: '붙잡아 오기', power: [0, 0], hint: '포획 전용', fx: 'grab',
    words: ['이리 와!', '어딜 튀어!', '질질~'],
    anims: ['anim-grab'],
    face: 'shock',
    icon: '<path d="M6 3v7a6 6 0 0 0 12 0V3"/><path d="M6 3h4v5H6zM14 3h4v5h-4z"/>'
  }
};

/* 물 바가지 (Enter 키 / 버튼) */
const WATER = {
  label: '물 뿌리기', power: 5, cooldownMs: 4000,
  words: ['첨벙!', '촤악—!', '시원하다!'],
  icon: '<path d="M5 9h14l-1.8 9.5a2 2 0 0 1-2 1.6H8.8a2 2 0 0 1-2-1.6z"/><path d="M8 9a4 4 0 0 1 8 0"/><path d="M10 13.5c.6 1 .6 2-.2 3M14 13.5c.6 1 .6 2-.2 3"/>'
};

/* 타격 횟수(누적)에 따른 칭호 */
const TITLES = [
  [0, '뿌린이'],
  [10, '견습 뿌셔러'],
  [30, '숙련 뿌셔러'],
  [60, '뿌셔 마스터'],
  [100, '전설의 뿌셔신']
];

/* ── 플레이리스트 ──
   PULSE ORIGIN(https://www.youtube.com/@PULSEORIGN) 트랙 — 69% 확률로 최우선 재생 */
const PULSE_TRACKS = [
  { id: '9E40d1donW4', label: '분위기 좋은 편집샵 재즈 힙합 🎷' },
  { id: 'N7XS4HasGk4', label: 'Late Night Jazz Hip Hop ☕' },
  { id: '-cZkpBoJ-1c', label: '마음이 조용해지는 인디 락' },
  { id: 'bAQlnYFfscE', label: 'Smooth R&B & Soul Mix' },
  { id: 'uVDR99PBFlg', label: '위험하게 분위기 좋은 둠칫 플리' },
  { id: 'G5PYccAFx3A', label: '걷다가 기분 좋아지는 도시팝 🚦' },
  { id: '4VZ6qgjB7jk', label: '연휴 필수 드라이브 팝 🚗' },
  { id: 'lH1YXw5oVk0', label: 'J-Rock for Late Night Drives' },
  { id: 'cMvrfbSdKwE', label: 'Stop Overthinking 🌙' },
  { id: 'AalYJfNXelk', label: '혼자 들으면 위험한 R&B 🔥' },
  { id: 'eUTnOGMh-v0', label: '위험하게 끌리는 Toxic R&B' }
];

/* 일반 음악 풀 (31% 확률) */
const MUSIC_POOL = [
  { id: '9bZkp7q19f0', label: '신나게 뿌셔 — 강남스타일' },
  { id: 'jfKfPfyJRdk', label: 'lofi 집중 라디오 (라이브)' },
  { id: 'JGwWNGJdvx8', label: 'Shape of You' },
  { id: 'kJQP7kiw5Fk', label: 'Despacito' },
  { id: 'dQw4w9WgXcQ', label: '기분전환 랜덤 픽' }
];

/* ============================================================
   서트레스 SHUTRESS — 공유 카드 & 공유하기
   간절한 표정의 두두를 담은 1080x1080 PNG를 그려서
   카카오톡 / 인스타그램 / 기본 공유 시트 / 링크 복사로 내보낸다.

   카카오톡 직접 공유는 config.js 의 kakaoJsKey 가 있을 때만 동작하고,
   없으면 기기의 기본 공유 시트로 넘긴다(모바일이면 거기에 카톡이 뜬다).
   ============================================================ */
const Share = (() => {
  const cfg = window.SHUTRESS_CONFIG || {};
  const SITE = 'https://shutress.ws-qf.com/';
  const W = 1080, H = 1080;
  const KO = '"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",Pretendard,sans-serif';

  let cache = { key: '', blob: null };

  /* charSVG 는 외부 style.css 에 기대므로, 단독 이미지로 구우려면 규칙을 인라인으로 심어야 한다 */
  const INLINE_CSS = `
    .acc{fill:none;stroke:#3A3230;stroke-width:9;stroke-linecap:round;stroke-linejoin:round}
    .eye{fill:#151515}.mouthfill{fill:#4B1E1E}
    .fx{fill:none;stroke:#151515;stroke-width:12;stroke-linecap:round;stroke-linejoin:round}
    .tear{fill:#80C8F8}.star{fill:#ECB22E}
    .face{display:none}.f-plead{display:block}`;

  function pleadSVG(c) {
    return charSVG(c, 'plead')
      .replace('<svg class="char-svg"', '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="540"')
      .replace('<defs>', `<style>${INLINE_CSS}</style><defs>`);
  }

  function svgToImage(svg) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = err => { URL.revokeObjectURL(url); reject(err); };
      img.src = url;
    });
  }

  /* 폭을 넘기면 말줄임 */
  function fit(x, text, max) {
    if (x.measureText(text).width <= max) return text;
    let s = text;
    while (s.length > 1 && x.measureText(s + '…').width > max) s = s.slice(0, -1);
    return s + '…';
  }

  function roundRect(x, l, t, w, h, r) {
    if (x.roundRect) { x.beginPath(); x.roundRect(l, t, w, h, r); return; }
    x.beginPath();
    x.moveTo(l + r, t);
    x.arcTo(l + w, t, l + w, t + h, r);
    x.arcTo(l + w, t + h, l, t + h, r);
    x.arcTo(l, t + h, l, t, r);
    x.arcTo(l, t, l + w, t, r);
    x.closePath();
  }

  async function buildCard() {
    const c = state.selected;
    const key = `${c.id}|${state.name}`;
    if (cache.key === key && cache.blob) return cache.blob;

    const img = await svgToImage(pleadSVG(c));
    try { await document.fonts.ready; } catch (_) {}

    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const x = cv.getContext('2d');

    /* 배경: 서트레스 퍼플 + 바닥 노란 조명 */
    const bg = x.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#4A154B'); bg.addColorStop(1, '#7B2D7E');
    x.fillStyle = bg; x.fillRect(0, 0, W, H);
    const glow = x.createRadialGradient(W / 2, H * 0.72, 0, W / 2, H * 0.72, W * 0.52);
    glow.addColorStop(0, 'rgba(236,178,46,.20)'); glow.addColorStop(1, 'rgba(236,178,46,0)');
    x.fillStyle = glow; x.fillRect(0, 0, W, H);

    x.textAlign = 'center';

    x.fillStyle = 'rgba(255,255,255,.55)';
    x.font = `700 30px ${KO}`;
    x.fillText('서트레스 · SHUT THE STRESS', W / 2, 94);

    x.fillStyle = '#ECB22E';
    x.font = `800 76px ${KO}`;
    x.fillText('스트레스 100% 해소!', W / 2, 190);

    x.fillStyle = 'rgba(255,255,255,.92)';
    x.font = `700 36px ${KO}`;
    x.fillText(fit(x, `${state.name} ${c.role} 완전 격파`, 860), W / 2, 250);

    /* 간절한 두두 */
    const cw = 436, ch = Math.round(cw * (540 / 512));
    x.drawImage(img, W / 2 - cw / 2, 300, cw, ch);

    /* 말풍선 */
    const by = 800, bh = 108, bx = 120, bw = W - 240;
    x.fillStyle = '#fff';
    x.beginPath();
    x.moveTo(W / 2 - 28, by + 6); x.lineTo(W / 2, by - 32); x.lineTo(W / 2 + 28, by + 6);
    x.closePath(); x.fill();
    roundRect(x, bx, by, bw, bh, 54); x.fill();

    x.fillStyle = '#4A154B';
    x.font = `800 44px ${KO}`;
    x.fillText('너도 와서 뿌셔… 제발 🥺', W / 2, by + 70);

    x.fillStyle = 'rgba(255,255,255,.85)';
    x.font = `700 34px ${KO}`;
    x.fillText('shutress.ws-qf.com', W / 2, 992);

    const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
    cache = { key, blob };
    return blob;
  }

  function cardFile(blob) {
    return new File([blob], 'shutress.png', { type: 'image/png' });
  }
  function shareText() {
    return `${state.name} ${state.selected.role} 완전 격파! 스트레스 100% 해소 😮‍💨`;
  }
  function download(blob) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'shutress-share.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  /* 기본 공유 시트 — 모바일이면 여기에 카톡·인스타가 함께 뜬다 */
  async function shareNative() {
    const blob = await buildCard();
    const file = cardFile(blob);
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], text: shareText(), url: SITE });
      return 'shared';
    }
    if (navigator.share) {
      await navigator.share({ title: '서트레스 SHUTRESS', text: shareText(), url: SITE });
      return 'shared';
    }
    download(blob);
    try { await navigator.clipboard.writeText(SITE); } catch (_) {}
    return 'fallback';
  }

  function loadKakao(key) {
    return new Promise((resolve, reject) => {
      const init = () => {
        if (!window.Kakao.isInitialized()) window.Kakao.init(key);
        resolve();
      };
      if (window.Kakao) return init();
      const s = document.createElement('script');
      s.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
      s.onload = init;
      s.onerror = () => reject(new Error('kakao sdk load failed'));
      document.head.appendChild(s);
    });
  }

  async function toKakao() {
    const key = cfg.kakaoJsKey || '';
    if (!key) return shareNative();          // 키 미설정 → 기본 공유 시트로
    await loadKakao(key);
    const blob = await buildCard();
    const up = await window.Kakao.Share.uploadImage({ file: [cardFile(blob)] });
    await window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: '서트레스 — 스트레스 100% 해소!',
        description: `${state.name} ${state.selected.role} 완전 격파! 너도 와서 뿌셔… 제발 🥺`,
        imageUrl: up.infos.original.url,
        link: { mobileWebUrl: SITE, webUrl: SITE }
      },
      buttons: [{ title: '나도 뿌시러 가기', link: { mobileWebUrl: SITE, webUrl: SITE } }]
    });
    return 'shared';
  }

  /* 인스타그램은 웹에서 바로 게시하는 공개 API가 없다 → 시트로 넘기거나 이미지를 저장해 직접 올리게 안내 */
  async function toInstagram() {
    const blob = await buildCard();
    const file = cardFile(blob);
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], text: shareText() });
      return 'shared';
    }
    download(blob);
    return 'downloaded';
  }

  async function copyLink() {
    await navigator.clipboard.writeText(SITE);
    return 'copied';
  }

  return { buildCard, shareNative, toKakao, toInstagram, copyLink, download };
})();

/* ---------- 완전 해소 오버레이의 공유 버튼 배선 ---------- */
(() => {
  const msg = document.getElementById('shMsg');
  const say = (t, ok = true) => {
    if (!msg) return;
    msg.textContent = t;
    msg.className = 'share__msg' + (ok ? ' ok' : ' err');
  };

  /* 사용자가 공유 시트를 그냥 닫은 것은 실패가 아니다 */
  const aborted = e => e && (e.name === 'AbortError' || e.name === 'NotAllowedError');

  function wire(id, fn, done) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      btn.disabled = true;
      say('준비 중…');
      try {
        const r = await fn();
        say(done(r));
      } catch (err) {
        if (aborted(err)) say('');
        else { console.warn('share error:', err); say('공유에 실패했어요. 잠시 후 다시 시도해 주세요.', false); }
      } finally {
        btn.disabled = false;
      }
    });
  }

  wire('shKakao', () => Share.toKakao(), r =>
    r === 'fallback' ? '이미지를 저장하고 링크를 복사했어요. 카톡에 붙여넣어 주세요!' : '');
  wire('shInsta', () => Share.toInstagram(), r =>
    r === 'downloaded' ? '이미지를 저장했어요! 인스타그램에 올려주세요 📸' : '');
  wire('shMore', () => Share.shareNative(), r =>
    r === 'fallback' ? '이미지를 저장하고 링크를 복사했어요!' : '');
  wire('shLink', () => Share.copyLink(), () => '링크를 복사했어요! 🔗');
})();

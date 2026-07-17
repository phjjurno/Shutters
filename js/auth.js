/* ============================================================
   서트레스 SHUTRESS — 가벼운 프로필(아이디/비번/닉네임) 인증
   이메일 대신 아이디를 받아 내부적으로 id@shutress.app 형태의
   합성 이메일로 Supabase Auth 를 쓴다. (이메일 발송 없음)
   ※ Supabase 대시보드에서 "Confirm email" 을 꺼야 가입 즉시 로그인됨.
   ============================================================ */
const Auth = (() => {
  const cfg = window.SHUTRESS_CONFIG || {};
  const url = (cfg.supabaseUrl || '').replace(/\/+$/, '');
  const key = cfg.supabaseAnonKey || '';
  const EMAIL_DOMAIN = '@shutress.app';

  let user = null;
  let nickname = null;

  const idToEmail = id => String(id).trim().toLowerCase() + EMAIL_DOMAIN;
  const headers = (auth) => {
    const h = { 'apikey': key, 'Content-Type': 'application/json' };
    if (auth) h['Authorization'] = 'Bearer ' + (sessionStorage.getItem('sb-token') || '');
    return h;
  };

  function saveTokens(d) {
    const at = d.access_token || d.session?.access_token;
    const rt = d.refresh_token || d.session?.refresh_token;
    if (at) sessionStorage.setItem('sb-token', at);
    if (rt) sessionStorage.setItem('sb-refresh', rt);
    return at;
  }

  /* 페이지 로드 시 기존 세션 복구 + 닉네임 로드 */
  async function getSession() {
    if (!url || !key || !sessionStorage.getItem('sb-token')) return null;
    try {
      const res = await fetch(`${url}/auth/v1/user`, { headers: headers(true) });
      if (res.ok) {
        user = await res.json();
        await loadNickname();
        return user;
      }
    } catch (e) {}
    return null;
  }

  async function signUp(id, password, nick) {
    if (!url || !key) return { error: '서버 설정이 필요해요.' };
    try {
      const res = await fetch(`${url}/auth/v1/signup`, {
        method: 'POST', headers: headers(false),
        body: JSON.stringify({ email: idToEmail(id), password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const m = (data.msg || data.error_description || '').toLowerCase();
        if (m.includes('registered') || m.includes('already')) return { error: '이미 있는 아이디예요.' };
        if (m.includes('password')) return { error: '비밀번호는 6자 이상이어야 해요.' };
        return { error: '프로필 만들기에 실패했어요.' };
      }
      if (!saveTokens(data)) {
        // Confirm email 이 아직 켜져 있는 경우 (세션이 안 옴)
        return { error: '가입은 됐지만 승인 대기 상태예요. 관리자에게 문의해 주세요.' };
      }
      user = data.user;
      nickname = (nick || '').trim() || String(id).trim();
      await createProfile(user.id, nickname);
      return { user };
    } catch (e) {
      return { error: e.message };
    }
  }

  async function signIn(id, password) {
    if (!url || !key) return { error: '서버 설정이 필요해요.' };
    try {
      const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
        method: 'POST', headers: headers(false),
        body: JSON.stringify({ email: idToEmail(id), password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !saveTokens(data)) return { error: '아이디 또는 비밀번호가 맞지 않아요.' };
      user = data.user;
      await loadNickname();
      return { user };
    } catch (e) {
      return { error: e.message };
    }
  }

  async function signOut() {
    sessionStorage.removeItem('sb-token');
    sessionStorage.removeItem('sb-refresh');
    user = null; nickname = null;
    return { ok: true };
  }

  async function createProfile(userId, nick) {
    if (!url || !key) return;
    try {
      await fetch(`${url}/rest/v1/user_profiles`, {
        method: 'POST',
        headers: { ...headers(true), 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({ id: userId, username: nick })
      });
    } catch (e) {}
  }

  async function loadNickname() {
    if (!user) return;
    try {
      const res = await fetch(`${url}/rest/v1/user_profiles?id=eq.${user.id}&select=username`, { headers: headers(true) });
      if (res.ok) { const d = await res.json(); nickname = d[0]?.username || null; }
    } catch (e) {}
  }

  async function getSavedChar() {
    if (!user || !url || !key) return null;
    try {
      const res = await fetch(`${url}/rest/v1/user_profiles?id=eq.${user.id}&select=saved_char_id`, { headers: headers(true) });
      if (res.ok) { const d = await res.json(); return d[0]?.saved_char_id || null; }
    } catch (e) {}
    return null;
  }

  async function saveChar(charId) {
    if (!user || !url || !key) return false;
    try {
      const res = await fetch(`${url}/rest/v1/user_profiles?id=eq.${user.id}`, {
        method: 'PATCH', headers: headers(true),
        body: JSON.stringify({ saved_char_id: charId })
      });
      return res.ok;
    } catch (e) { return false; }
  }

  const getNickname = () => nickname || (user ? user.email.split('@')[0] : null);

  return { getSession, signUp, signIn, signOut, getSavedChar, saveChar, getUser: () => user, getNickname };
})();

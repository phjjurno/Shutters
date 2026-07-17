const Auth = (() => {
  const cfg = window.SHUTRESS_CONFIG || {};
  const url = (cfg.supabaseUrl || '').replace(/\/+$/, '');
  const key = cfg.supabaseAnonKey || '';

  let session = null;
  let user = null;

  async function getSession() {
    if (!url || !key) return null;
    try {
      const res = await fetch(`${url}/auth/v1/user`, {
        headers: { 'apikey': key, 'Authorization': 'Bearer ' + (sessionStorage.getItem('sb-token') || '') }
      });
      if (res.ok) {
        user = await res.json();
        return user;
      }
    } catch (e) {}
    return null;
  }

  async function signUp(email, password, username) {
    if (!url || !key) return { error: 'Not configured' };
    try {
      const res = await fetch(`${url}/auth/v1/signup`, {
        method: 'POST',
        headers: { 'apikey': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) return { error: await res.text() };
      const data = await res.json();
      if (data.session?.access_token) {
        sessionStorage.setItem('sb-token', data.session.access_token);
        sessionStorage.setItem('sb-refresh', data.session.refresh_token);
        user = data.user;
        await createProfile(user.id, username);
        return { user: data.user };
      }
      return { error: 'No session' };
    } catch (e) {
      return { error: e.message };
    }
  }

  async function signIn(email, password) {
    if (!url || !key) return { error: 'Not configured' };
    try {
      const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'apikey': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) return { error: '로그인 실패' };
      const data = await res.json();
      if (data.access_token) {
        sessionStorage.setItem('sb-token', data.access_token);
        sessionStorage.setItem('sb-refresh', data.refresh_token);
        user = data.user;
        return { user: data.user };
      }
      return { error: 'No token' };
    } catch (e) {
      return { error: e.message };
    }
  }

  async function signOut() {
    sessionStorage.removeItem('sb-token');
    sessionStorage.removeItem('sb-refresh');
    user = null;
    return { ok: true };
  }

  async function createProfile(userId, username) {
    if (!url || !key) return;
    try {
      const token = sessionStorage.getItem('sb-token');
      await fetch(`${url}/rest/v1/user_profiles`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: userId, username })
      });
    } catch (e) {}
  }

  async function getSavedChar() {
    if (!user || !url || !key) return null;
    try {
      const token = sessionStorage.getItem('sb-token');
      const res = await fetch(`${url}/rest/v1/user_profiles?id=eq.${user.id}&select=saved_char_id`, {
        headers: { 'apikey': key, 'Authorization': 'Bearer ' + token }
      });
      if (res.ok) {
        const data = await res.json();
        return data[0]?.saved_char_id || null;
      }
    } catch (e) {}
    return null;
  }

  async function saveCha(charId) {
    if (!user || !url || !key) return false;
    try {
      const token = sessionStorage.getItem('sb-token');
      const res = await fetch(`${url}/rest/v1/user_profiles?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': key,
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ saved_char_id: charId })
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  return { getSession, signUp, signIn, signOut, getSavedChar, saveChar: saveCha, getUser: () => user };
})();

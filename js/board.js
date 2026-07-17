const Board = (() => {
  const cfg = window.SHUTRESS_CONFIG || {};
  const url = (cfg.supabaseUrl || '').replace(/\/+$/, '');
  const key = cfg.supabaseAnonKey || '';

  async function fetchPosts(limit = 20) {
    if (!url || !key) return [];
    try {
      const res = await fetch(
        `${url}/rest/v1/posts?order=created_at.desc&limit=${limit}`,
        { headers: { 'apikey': key } }
      );
      if (res.ok) return await res.json();
    } catch (e) {}
    return [];
  }

  async function createPost(content, charId) {
    if (!url || !key) return { error: 'Not configured' };
    const user = Auth.getUser();
    if (!user) return { error: '로그인 필요' };
    try {
      const token = sessionStorage.getItem('sb-token');
      const res = await fetch(`${url}/rest/v1/posts`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          username: (Auth.getNickname && Auth.getNickname()) || user.email.split('@')[0],
          content,
          char_id: charId
        })
      });
      if (res.ok) return { ok: true };
      return { error: await res.text() };
    } catch (e) {
      return { error: e.message };
    }
  }

  async function deletePost(postId) {
    if (!url || !key) return { error: 'Not configured' };
    const user = Auth.getUser();
    if (!user) return { error: '로그인 필요' };
    try {
      const token = sessionStorage.getItem('sb-token');
      const res = await fetch(`${url}/rest/v1/posts?id=eq.${postId}`, {
        method: 'DELETE',
        headers: {
          'apikey': key,
          'Authorization': 'Bearer ' + token
        }
      });
      return { ok: res.ok };
    } catch (e) {
      return { error: e.message };
    }
  }

  return { fetchPosts, createPost, deletePost };
})();

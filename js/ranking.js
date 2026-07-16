/* ============================================================
   서트레스 SHUTRESS — 전역(전국) 통합 랭킹 클라이언트
   Supabase REST(RPC)로 캐릭터별 집계를 합산 저장/조회한다.
   config.js 가 비어 있으면 enabled()=false → 앱은 로컬 랭킹만 사용.
   개인 식별 정보는 전송하지 않으며, 캐릭터별 hits/clears 숫자만 주고받는다.
   ============================================================ */
const Ranking = (() => {
  const cfg = (window.SHUTRESS_CONFIG || {});
  const url = (cfg.supabaseUrl || '').replace(/\/+$/, '');
  const key = cfg.supabaseAnonKey || '';
  const on = !!(url && key);

  const headers = {
    'Content-Type': 'application/json',
    'apikey': key,
    'Authorization': 'Bearer ' + key
  };

  // 클릭마다 요청하지 않도록 증분을 모아 두었다가 일정 주기로 flush
  const pending = {};        // { charId: { dh, dc } }
  let flushTimer = null;
  let flushing = false;

  function queue(charId, dh = 0, dc = 0) {
    if (!on) return;
    const p = pending[charId] || (pending[charId] = { dh: 0, dc: 0 });
    p.dh += dh; p.dc += dc;
    if (!flushTimer) flushTimer = setTimeout(flush, 4000);
  }

  async function flush() {
    flushTimer = null;
    if (!on || flushing) return;
    const ids = Object.keys(pending);
    if (!ids.length) return;
    flushing = true;
    // 스냅샷 후 버퍼 비우기 (실패하면 되돌려 재시도)
    const batch = ids.map(id => ({ id, ...pending[id] }));
    ids.forEach(id => delete pending[id]);
    try {
      await Promise.all(batch.map(b =>
        fetch(`${url}/rest/v1/rpc/bump_char`, {
          method: 'POST', headers,
          body: JSON.stringify({ cid: b.id, dh: b.dh, dc: b.dc })
        }).then(r => { if (!r.ok) throw new Error('rpc ' + r.status); })
      ));
    } catch (e) {
      // 실패분은 버퍼에 되돌려 다음 기회에 재시도
      batch.forEach(b => {
        const p = pending[b.id] || (pending[b.id] = { dh: 0, dc: 0 });
        p.dh += b.dh; p.dc += b.dc;
      });
      if (!flushTimer) flushTimer = setTimeout(flush, 8000);
    } finally {
      flushing = false;
    }
  }

  // 상위 랭킹 조회 → [{ char_id, hits, clears }]
  async function fetchTop(limit = 12) {
    if (!on) return null;
    const res = await fetch(
      `${url}/rest/v1/char_stats?select=char_id,hits,clears&order=hits.desc&limit=${limit}`,
      { headers }
    );
    if (!res.ok) throw new Error('select ' + res.status);
    return res.json();
  }

  // 페이지 이탈 직전 남은 증분 최대한 전송
  if (on) {
    window.addEventListener('pagehide', () => {
      const ids = Object.keys(pending);
      if (!ids.length || !navigator.sendBeacon) return;
      ids.forEach(id => {
        const b = pending[id];
        const blob = new Blob(
          [JSON.stringify({ cid: id, dh: b.dh, dc: b.dc })],
          { type: 'application/json' }
        );
        // sendBeacon 은 커스텀 헤더 불가 → apikey 를 쿼리로 전달
        navigator.sendBeacon(`${url}/rest/v1/rpc/bump_char?apikey=${encodeURIComponent(key)}`, blob);
      });
    });
  }

  return { enabled: () => on, queue, flush, fetchTop };
})();

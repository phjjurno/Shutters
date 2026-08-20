# 전국 통합 랭킹 백엔드 설정 (Supabase · 무료)

서트레스는 기본적으로 랭킹을 **이 기기(브라우저 localStorage)** 에만 저장합니다.
아래 5분 설정을 마치면 **여러 기기·방문자를 합산한 전국 통합 랭킹**이 켜집니다.
서버 코드를 직접 운영할 필요 없이 Supabase 무료 플랜만으로 동작해요.

> 개인정보는 전송하지 않습니다. 캐릭터별 누적 `hits`(타격) / `clears`(완전 해소) 숫자만 주고받습니다.

## 1. Supabase 프로젝트 만들기
1. https://supabase.com 에서 무료 가입 → **New project** 생성 (Region은 Northeast Asia 권장).
2. 프로젝트가 준비되면 **Project Settings → API** 에서 두 값을 복사:
   - **Project URL** (예: `https://abcd1234.supabase.co`)
   - **anon public** 키 (공개돼도 되는 키)

## 2. 테이블 + 함수 만들기
좌측 **SQL Editor** 에 아래를 붙여넣고 **Run**:

```sql
-- 캐릭터별 집계 테이블
create table if not exists char_stats (
  char_id text primary key,
  hits    bigint not null default 0,
  clears  bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- 원자적 증가 함수 (클라이언트가 호출)
create or replace function bump_char(cid text, dh int, dc int)
returns void
language sql
security definer
as $$
  insert into char_stats(char_id, hits, clears, updated_at)
  values (cid, greatest(dh,0), greatest(dc,0), now())
  on conflict (char_id) do update
    set hits = char_stats.hits + greatest(excluded.hits,0),
        clears = char_stats.clears + greatest(excluded.clears,0),
        updated_at = now();
$$;

-- RLS: 읽기는 누구나, 쓰기는 함수(bump_char)를 통해서만
alter table char_stats enable row level security;

drop policy if exists "read stats" on char_stats;
create policy "read stats" on char_stats for select using (true);

grant execute on function bump_char(text, int, int) to anon;
```

## 3. 키 넣기
`js/config.js` 를 열어 두 값을 채웁니다:

```js
window.SHUTRESS_CONFIG = {
  supabaseUrl: 'https://abcd1234.supabase.co',
  supabaseAnonKey: 'eyJhbGciOi...(anon public 키)'
};
```

저장하고 새로고침하면 랭킹 섹션에 **🌐 전국 통합 / 📱 이 기기** 토글이 나타나고,
타격할 때마다 집계가 서버로 합산 저장됩니다. (요청은 4초 간격으로 묶어서 전송)

## 참고 · 한계
- anon 키로 클라이언트가 직접 증가시키므로 **수치 조작이 원천 차단되지는 않습니다.**
  캐주얼 게임 수준에선 충분하지만, 엄격한 방지가 필요하면 다음 단계로:
  - Supabase **Edge Function** 을 두고 rate-limit / 서명 검증 후 증가시키기
  - 또는 Cloudflare Turnstile 등 봇 차단 결합
- 무료 플랜 한도(월 요청 수)를 넘어설 정도로 커지면 유료 전환 또는 캐싱(예: 랭킹 30초 캐시)을 고려하세요.
- 키를 바꾸지 않고 되돌리려면 `config.js` 의 두 값을 다시 빈 문자열로 두면 즉시 로컬 전용으로 돌아갑니다.

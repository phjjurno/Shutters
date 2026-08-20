# 서트레스 SHUTRESS — 배포 체크리스트 🚀

이 폴더(`bbusyeo/`)를 통째로 정적 호스팅에 올리면 됩니다. 순서대로 확인하세요.

## 1. 배포 전 — 파일 손보기

- [ ] **도메인 치환**: 실제 도메인이 `shutress.com`이 아니라면 아래 파일에서 일괄 치환
  - `index.html` — `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image`, JSON-LD의 모든 `url`
  - `sitemap.xml` — `<loc>` 3곳
  - `robots.txt` — `Sitemap:` 줄
- [ ] **애드센스 게시자 ID 확인**: `ads.txt`와 `index.html` 주석의
  `pub-8501673409971666`이 **본인 애드센스 계정 ID인지 확인** (wsQf-PDF에서 가져온 값).
  다르면 두 곳 모두 교체. 애드센스 **승인 후** `index.html`의 스크립트 주석을 해제.
- [ ] **통합 랭킹(선택)**: `SETUP-BACKEND.md` 대로 Supabase 세팅 후 `js/config.js`에
  URL·anon 키 입력. 안 쓰면 그대로 두기(자동으로 이 기기 전용).
- [ ] **design/ 폴더 제외(선택)**: 캐릭터 원본 키트는 서비스에 불필요 — 용량을 아끼려면
  배포 대상에서 빼도 됩니다(사이트 동작과 무관).

## 2. 호스팅에 올리기 (셋 중 하나)

### A. Netlify Drop (가장 빠름, 무료)
1. https://app.netlify.com/drop 접속
2. `bbusyeo` 폴더를 브라우저로 드래그 → 즉시 배포
3. Site settings → Domain management 에서 도메인 연결

### B. Vercel
```bash
cd "Mini Site/bbusyeo"
npx vercel --prod        # 로그인 후 안내 따라가기
```

### C. GitHub Pages
1. 새 저장소에 `bbusyeo` 내용물을 푸시 (저장소 루트에 index.html이 오도록)
2. Settings → Pages → Branch: main / root → Save
3. 커스텀 도메인 연결 시 CNAME 설정

> 어느 방법이든 **HTTPS가 자동 적용**되는지 확인 (애드센스 필수).

## 3. 배포 직후 — 동작 확인

- [ ] `https://도메인/` 접속 → 게임 정상 동작 (캐릭터 클릭 타격, 도망/포획, 물바가지)
- [ ] `https://도메인/ads.txt`, `/robots.txt`, `/sitemap.xml`, `/privacy.html`, `/terms.html` 각각 열리는지
- [ ] 모바일에서 레이아웃·탭 타격 확인
- [ ] 콘솔(F12)에 에러 없는지

## 4. 검색엔진 & SNS 등록

- [ ] **Google Search Console** (https://search.google.com/search-console)
  - 도메인 등록 → 소유권 확인 → `sitemap.xml` 제출
- [ ] **네이버 서치어드바이저** (https://searchadvisor.naver.com) — 사이트 등록 + 사이트맵 제출
- [ ] **OG 미리보기 확인**: https://www.opengraph.xyz 등에서 도메인 입력 →
  서트레스 배너(og.svg)가 뜨는지. 카카오톡은 https://developers.kakao.com/tool/debugger/sharing 에서 캐시 초기화.

## 5. 애드센스 신청 (준비된 상태)

이미 갖춰진 것: 개인정보처리방침 ✓ 이용약관 ✓ 문의 ✓ ads.txt ✓ 텍스트 콘텐츠(가이드·FAQ) ✓
모바일 대응 ✓ robots 허용 ✓

- [ ] https://adsense.google.com 에서 사이트 추가 → 검토 요청
- [ ] 승인되면 `index.html`의 애드센스 `<script>` 주석 해제
- [ ] `.ad-placeholder` 2곳을 실제 광고 단위 코드로 교체
- [ ] EU/영국 트래픽을 받을 계획이면 Google CMP(동의 관리) 설정 켜기

## 6. 운영 팁

- 코드 수정 후 재배포 시 `index.html`의 `?v=` 숫자를 올리면 방문자 캐시가 즉시 갱신됩니다.
- PULSE ORIGIN 트랙 목록은 `js/data.js`의 `PULSE_TRACKS`에서 관리 (id = 유튜브 영상 ID).
- 문의 메일: vspo2@yonsei.ac.kr (플레이리스트 광고·제휴 문의 문구는 문의 섹션에 반영됨)

/* ============================================================
   서트레스 SHUTRESS — 백엔드 설정
   전역(전국) 통합 랭킹을 켜려면 아래 두 값을 채우세요.
   비워 두면 자동으로 "이 기기(localStorage) 전용"으로 동작합니다.

   설정 방법은 같은 폴더의 SETUP-BACKEND.md 를 참고하세요.
   - supabaseUrl   : 예) https://xxxxxxxx.supabase.co
   - supabaseAnonKey: Supabase 프로젝트의 anon public 키 (공개돼도 되는 키)
   - kakaoJsKey    : 카카오 개발자 JavaScript 키 (공유 도메인 등록 필수, 공개돼도 되는 키)
   ============================================================ */
window.SHUTRESS_CONFIG = {
  supabaseUrl: 'https://eumocvkejlbfsemmkmwr.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1bW9jdmtlamxiZnNlbW1rbXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxODc1NzEsImV4cCI6MjA5OTc2MzU3MX0.92uB2cKWVMi9voqd1DgDA7PPOWQ0b--o4F23OtHoBIk',
  kakaoJsKey: '8854c7642232e68278ca4a677ca2a8a0'
};

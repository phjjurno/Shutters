# 두두(DUDU) 캐릭터 스타터 키트

## 폴더 구성
- `assets/reference/`: 전체 캐릭터 디자인 시트
- `assets/character/`: 정면·측면·후면, 표정, 피격 반응, SVG 기본형
- `design/character-config.json`: 상태, 컬러, 피격 강도, 애니메이션 수치
- `design/design-spec.md`: 화면·모션·사운드 가이드
- `src/index.html`, `src/style.css`, `src/game.js`: 브라우저에서 바로 실행되는 기본 프로토타입

## 실행
`src/index.html`을 브라우저로 열거나, 프로젝트 루트에서 로컬 서버를 실행하세요.

```bash
python3 -m http.server 8080
```

그다음 `http://localhost:8080/src/`로 접속합니다.

## Claude Code에 넣을 요청문
아래처럼 입력하면 됩니다.

> 이 폴더의 `design/character-config.json`과 `assets/character/`를 기준으로 모바일 우선 스트레스 해소 클릭 게임을 구현해줘. 캐릭터를 클릭하거나 스와이프하면 피격 강도에 따라 표정, 스쿼시, 화면 흔들림, 별 파티클이 달라져야 한다. 3초 동안 입력이 없으면 캐릭터가 회복한다. 과도한 폭력 표현이나 피는 사용하지 말고 봉제인형처럼 코믹하게 구현해줘.

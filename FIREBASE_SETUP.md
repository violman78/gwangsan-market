# 공유 채팅 서버(Firebase) 안내

이 사이트는 **관리자 없이 온라인으로만 운영**합니다. 서버 기능은 **공유 채팅(문제 상황 사진·메시지)** 하나뿐입니다.

## 현재 상태
- Firebase 프로젝트 `gwangsan-market-269e8` 연결 완료 (`assets/config.js`)
- Firestore(서울) · 익명 로그인 사용 · 승인된 도메인 `violman78.github.io` 등록 완료
- 채팅 메시지는 접속자 누구나 읽고 쓸 수 있으며, 글자 500자·사진 약 900KB 이내로 제한됩니다.

## 알아둘 점
- 채팅은 사이트 주소를 아는 사람이면 누구나 읽을 수 있습니다. 개인정보가 담긴 사진은 올리지 마세요.
- 메시지 삭제는 Firebase 콘솔(Firestore → chat 컬렉션)에서만 가능합니다.
- 채팅이 필요 없으면 `assets/config.js`를 `window.FIREBASE_CONFIG = null;` 한 줄로 바꾸면 채팅 입력창이 “서버 연결 전”으로 바뀝니다.
- 행사 종료 후에는 Firebase 콘솔에서 프로젝트를 삭제하거나 Firestore 규칙을 `allow read, write: if false;`로 바꿔 두세요.

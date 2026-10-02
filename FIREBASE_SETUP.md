# 총괄 서버(Firebase) 연결 안내 — 일정 수정 · 긴급공지 · 공유 채팅

GitHub Pages는 정적 사이트라 “총괄이 고치면 모두에게 반영 · 긴급공지 · 채팅”에는 서버가 필요합니다.
**Firebase 무료(Spark) 요금제**로 충분하며, 설정은 약 10분입니다. (카드 등록 불필요)

## 1. 프로젝트 만들기
1. https://console.firebase.google.com 접속 → Google 계정 로그인 → **프로젝트 추가** → 이름 `gwangsan-market` → (Analytics 끔) → 만들기
2. 왼쪽 **빌드 → Firestore Database → 데이터베이스 만들기** → 위치 `asia-northeast3 (서울)` → **프로덕션 모드**로 시작
3. 왼쪽 **빌드 → Authentication → 시작하기** → **로그인 방법**에서 두 가지를 “사용 설정”
   - **익명** (일반 참여자용)
   - **이메일/비밀번호** (총괄 계정용)
4. **Authentication → 사용자 → 사용자 추가**: 총괄 이메일과 비밀번호를 직접 만듭니다. (이 계정만 일정 수정·긴급공지 가능)
5. **Authentication → 설정 → 승인된 도메인 → 도메인 추가**: `violman78.github.io`

## 2. 보안 규칙 넣기 (중요)
**Firestore Database → 규칙** 탭에 아래를 붙여 넣고 `총괄이메일@example.com`을 4번에서 만든 이메일로 바꾼 뒤 **게시**합니다.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && request.auth.token.email in ['총괄이메일@example.com'];
    }
    match /config/{doc} { allow read: if true; allow write: if isAdmin(); }
    match /alerts/{doc} { allow read: if true; allow write: if isAdmin(); }
    match /chat/{doc} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
        && request.resource.data.keys().hasOnly(['name','text','photo','ts'])
        && request.resource.data.name is string && request.resource.data.name.size() <= 30
        && request.resource.data.text is string && request.resource.data.text.size() <= 500
        && (!('photo' in request.resource.data) || request.resource.data.photo.size() < 900000);
      allow update: if false;
      allow delete: if isAdmin();
    }
  }
}
```

## 3. 사이트에 연결하기
1. Firebase 콘솔 **프로젝트 설정(톱니바퀴) → 일반 → 내 앱 → 웹 앱(</>) 추가** → 앱 이름 입력 → 등록
2. 화면에 나오는 `firebaseConfig = { ... }` 값을 복사합니다.
3. 이 사이트의 `assets/config.js`를 열어 `window.FIREBASE_CONFIG = null;` 부분을 복사한 값으로 바꿉니다.
   ```js
   window.FIREBASE_CONFIG = { apiKey: "...", authDomain: "...", projectId: "...", storageBucket: "...", messagingSenderId: "...", appId: "..." };
   ```
   (apiKey는 공개되어도 되는 값이며, 접근은 위 보안 규칙이 막아 줍니다.)
4. 저장소에서 `assets/config.js`만 다시 업로드(또는 편집 → Commit)합니다.

## 4. 사용 방법
| 기능 | 위치 | 설명 |
|---|---|---|
| 총괄 로그인 | `…/admin/` | 4번에서 만든 이메일/비밀번호. 주소는 총괄만 알고 있으면 됩니다(메뉴에 없음). |
| 일정 수정 | `admin/` → 일정 순서 수정 | 시간·이름·설명 수정, 위/아래 이동, 삭제, 추가 → **저장** 하면 모든 휴대폰의 일정과 “지금/다음 순서”가 즉시 바뀝니다. |
| 긴급 공지 | `admin/` → 긴급 공지 보내기 | 발송 즉시 열려 있는 모든 화면에 **전체 화면 빨간 경고 + 진동 + 알림음**. “확인했습니다”를 눌러야 닫힙니다. |
| 공유 채팅 | `…/chat/` | 사진 촬영(카메라) + 내용 전송, 모두에게 실시간 공유. 총괄은 메시지 삭제 가능. |
| 알림 켜기 | 홈 “긴급 알림 켜기” | 참여자가 처음 한 번 눌러 둡니다(진동 허용·알림 권한). |

## 5. 알아둘 한계 (솔직하게)
- **진동은 안드로이드(크롬) 휴대폰에서 지원**됩니다. **아이폰(사파리)은 웹에서 진동을 허용하지 않아** 빨간 전체 화면 + 알림음으로만 표시됩니다.
- 화면을 꺼 두었거나 사이트를 닫은 상태에서는 긴급공지가 오지 않습니다(다음에 열 때 확인되지 않은 공지가 먼저 뜹니다). 완전한 백그라운드 푸시는 별도 앱(FCM)이 필요합니다. 현장에서는 **사이트를 열어 둔 상태**를 기본으로 하고, 급한 경우 단체 톡방 공지를 병행하세요.
- 채팅 사진은 크기를 줄여(약 1000px) 저장합니다. 채팅은 사이트 주소를 아는 사람이면 누구나 읽을 수 있으니 개인정보 사진은 올리지 마세요.
- 체험해 보기: 서버 설정 전에도 주소 끝에 `?demo=1`을 붙이면 **이 기기 안에서만** 동작하는 체험 모드로 볼 수 있습니다(총괄 비밀번호 `demo`).

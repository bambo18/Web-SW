# Web-SW — 실행 가이드

이 문서는 로컬에서 이 리포지터리를 실행하고 시연하기 위한 최소한의 설치·실행 절차를 정리합니다.

필수 전제
- Node.js + npm
- 로컬 MySQL 서버(또는 접근 가능한 MySQL 인스턴스)
- Windows + PowerShell(다른 셸도 가능하지만 본 문서는 PowerShell 예시 사용)

폴더 구조(주요):
- `scheduler-backend/` — Express + Socket.IO 백엔드
- `scheduler-backend/server/db/schema-mysql.sql` — MySQL 스키마
- `scheduler-backend/team-scheduler(경승이형ver)/` — Vite + React 프론트엔드 데모

설치 및 초기 설정
1. 소스 디렉토리로 이동:
```powershell
cd C:\Users\vygud\Documents\GitHub\Web-SW
```

2. 백엔드 의존성 설치:
```powershell
cd scheduler-backend
npm install
```

3. 프론트엔드 의존성(선택적, UI 시연용):
```powershell
cd "scheduler-backend\team-scheduler(경승이형ver)"
npm install
```

데이터베이스 준비
1. MySQL에서 데이터베이스와 계정 생성(관리자 권한 필요):
```sql
CREATE DATABASE IF NOT EXISTS scheduler CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER 'ws'@'127.0.0.1' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON scheduler.* TO 'ws'@'127.0.0.1';
FLUSH PRIVILEGES;
```

2. 스키마 적용 (PowerShell에서 안전하게 실행):
```powershell
# 방법 A: mysql 클라이언트의 SOURCE 사용
mysql -u root -p -h 127.0.0.1 scheduler -e "SOURCE C:/Users/vygud/Documents/GitHub/Web-SW/scheduler-backend/server/db/schema-mysql.sql;"

# 방법 B: PowerShell 파이프 사용 (mysql이 PATH에 없으면 전체 경로 사용)
Get-Content "C:\Users\vygud\Documents\GitHub\Web-SW\scheduler-backend\server\db\schema-mysql.sql" -Raw | mysql -u root -p -h 127.0.0.1 scheduler
```

환경변수 설정(세션 단위)
```powershell
$env:DB='mysql'
$env:DB_HOST='127.0.0.1'
$env:DB_USER='ws'
$env:DB_PASS='your_password'
$env:DB_NAME='scheduler'
```

백엔드 및 프론트 실행
1. 백엔드 시작:
```powershell
cd C:\Users\vygud\Documents\GitHub\Web-SW\scheduler-backend
npm start
```

2. 프론트(개발 모드):
```powershell
cd C:\Users\vygud\Documents\GitHub\Web-SW\scheduler-backend\team-scheduler(경승이형ver)
npm run dev
```

간단 검증
- 헬스 체크:
```powershell
curl http://localhost:4000/health
# => {"ok":true}
```

테스트 스크립트
- 간단 스모크 테스트:
```powershell
cd C:\Users\vygud\Documents\GitHub\Web-SW
node test/mysqlStore.spec.js
```

Socket.IO 간단 테스트
1. `scheduler-backend`에서 `socket.io-client` 설치(필요 시):
```powershell
cd scheduler-backend
npm install socket.io-client
```
2. `socket-test.js` 작성 후 실행(예시):
```javascript
// socket-test.js
const { io } = require('socket.io-client');
const socket = io('http://localhost:4000');
socket.on('connect', () => {
  const projectId = 1; const memberId = 1;
  socket.emit('join-project', { projectId, memberId });
  socket.emit('toggle-slot', { projectId, memberId, nickname: 'tester', day: 0, slot: 0 });
  setTimeout(()=> socket.disconnect(), 500);
});
```
```powershell
node socket-test.js
```

주의 및 문제해결
- `mysql` 명령을 찾을 수 없음: MySQL cli가 PATH에 없거나 설치되지 않음. `Get-Command mysql` 또는 `where.exe mysql`로 확인.
- PowerShell 리디렉션(`<'`) 문제: PowerShell은 `<`를 예약어로 처리합니다. 이 경우 `cmd /c \"mysql ... < file\"` 또는 `mysql -e \"SOURCE ...\"` 또는 `Get-Content ... | mysql ...` 사용.
- `Access denied` 에러: DB 사용자/비밀번호 또는 호스트(`127.0.0.1` vs `localhost`) 문제. 앱용 별도 계정(`ws@127.0.0.1`) 생성 권장.
- `npm start` 실행 실패(ExecutionPolicy): `npm.cmd start` 또는 `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` 사용.

시연 시나리오(요약)
1. 백엔드 실행 → `/health` 확인
2. `POST /project/create`로 프로젝트 생성(응답: `projectId`, `joinCode`)
3. REST로 참가 또는 프론트에서 참가
4. Socket.IO로 `join-project`/`toggle-slot` 발행 → 실시간 업데이트 확인
5. DB에서 `timetable_cell_members` 확인(데이터 영속성)

추가 도움
- 데모 자동화 스크립트나 프레젠테이션용 간단 슬라이드가 필요하면 알려주세요.
# db 연결법
# Node.js + npm
# MySQL 서버(로컬) — 계정/권한을 만들 수 있어야 함
# PowerShell 사용
#
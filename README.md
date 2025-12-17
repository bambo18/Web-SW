# Web-SW — 실행 가이드

이 문서는 로컬에서 이 리포지터리를 실행하고 시연하기 위한 최소한의 설치·실행 절차를 정리합니다.
실행전 server/db/mysql.js 파일에서 DB_PASS(코드블럭 8번째)의 값을 사용자의 mysql비밀번호로 바꾸세요. 실행방법은  $env:DB="mysql"node server/server.js 입니다
\필수 전제
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


테스트 스크립트
- 간단 스모크 테스트:
```powershell
cd C:\Users\vygud\Documents\GitHub\Web-SW
node test/mysqlStore.spec.js
```
sql문 예시
mysql -u ws -p -h 127.0.0.1 scheduler -e "SELECT * FROM timetable_cells LIMIT 50;"
mysql -u ws -p -h 127.0.0.1 scheduler -e "SELECT * FROM projects ORDER BY projectId DESC LIMIT 5;"
mysql -u ws -p -h 127.0.0.1 scheduler -e "SELECT * FROM members ORDER BY memberId DESC LIMIT 10;"

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

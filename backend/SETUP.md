# Moonshot Backend 개발 환경 설정 가이드

## 사전 준비사항

다음 도구들이 설치되어 있어야 합니다:

- **OrbStack**: Docker Desktop 대체 (이미 설치됨)
- **DevPod**: 개발 컨테이너 관리 (이미 설치됨)
- **Node.js 20+**: (이미 설치됨)
- **Git**: 버전 관리

## 1. 초기 설정

### 1.1. DevPod으로 저장소 열기

DevPod을 사용하여 저장소를 클론하고 개발 환경을 자동으로 설정합니다.

**방법 1: DevPod CLI 사용 (권장)**

```bash
# Git 저장소 URL로 DevPod 워크스페이스 생성 및 실행
devpod up https://github.com/nb07-Moonshot-Team2/NB07_Moonshot_Team2.git

# 또는 SSH URL 사용
devpod up git@github.com:nb07-Moonshot-Team2/NB07_Moonshot_Team2.git
```

**방법 2: DevPod GUI 사용**

1. DevPod 앱 실행
2. "Create Workspace" 클릭
3. Git URL 입력: `https://github.com/nb07-Moonshot-Team2/NB07_Moonshot_Team2.git`
4. "Create & Open" 클릭
5. VSCode가 자동으로 열리고 DevContainer가 시작됨

**DevPod이 자동으로 수행하는 작업:**
- 저장소 클론
- Docker 컨테이너 생성 (Node.js 20, PostgreSQL)
- VSCode 확장 자동 설치 (ESLint, Prettier, Prisma 등)
- 의존성 자동 설치 (`npm install`)
- 포트 포워딩 (3000, 5432)

**워크스페이스가 준비되면:**
- VSCode가 자동으로 열립니다
- `backend/` 폴더가 워크스페이스 루트로 설정됩니다
- 터미널이 DevContainer 내부에서 열립니다

### 1.2. 환경변수 설정

DevContainer 내부 터미널에서 `.env.example` 파일을 복사하여 `.env` 파일 생성:

```bash
# DevContainer 터미널에서 실행 (이미 backend 폴더에 있음)
cp .env.example .env
```

### 1.3. 팀 리더가 공유한 환경변수 업데이트

팀 리더가 공유한 `.env.shared` 파일의 내용을 `.env` 파일에 복사:

```bash
# DATABASE_URL: Render 공유 개발 DB URL (팀 리더가 제공)
# JWT_SECRET: 팀 리더가 생성한 JWT Secret
# JWT_REFRESH_SECRET: 팀 리더가 생성한 JWT Refresh Secret
# CLOUDINARY_*: 팀 리더가 생성한 Cloudinary 계정 정보
```

**중요**: `.env` 파일은 절대 Git에 커밋하지 마세요!

## 2. 개발 환경 실행

DevPod을 사용하면 모든 설정이 자동으로 완료되어 바로 개발을 시작할 수 있습니다.

### 2.1. 서버 실행

DevContainer 터미널에서:

```bash
# 개발 모드 실행 (Hot Reload)
npm run dev
```

서버가 실행되면:
- `http://localhost:3000/health` 접속 가능
- 코드 변경 시 자동 재시작
- 저장 시 자동 포맷팅 적용

**DevContainer 특징:**

- Node.js 20, Git, GitHub CLI, Zsh 자동 설치
- ESLint, Prettier, Prisma 확장 자동 설치
- 저장 시 자동 포맷팅 적용 (Prettier + ESLint)
- PostgreSQL 컨테이너 자동 연결
- 포트 자동 포워딩 (3000, 5432)


## 3. Prisma 설정

### 3.1. Prisma Client 생성

```bash
npm run db:generate
```

### 3.3. Prisma Studio (선택사항)

데이터베이스를 GUI로 확인하고 수정:

```bash
npm run db:studio
```

브라우저에서 `http://localhost:5555` 접속

## 4. 개발 워크플로우

### 4.1. 서버 실행

```bash
# 개발 모드 (Hot Reload)
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

### 4.2. Health Check 확인

서버 실행 후:

```bash
curl http://localhost:3000/health

# 예상 응답:
# {
#   "status": "ok",
#   "timestamp": "2026-01-29T...",
#   "uptime": 123.45
# }
```

### 4.3. 코드 품질 검사

```bash
# ESLint 검사
npm run lint

# ESLint 자동 수정
npm run lint:fix

# Prettier 포맷 확인
npm run format:check

# Prettier 자동 포맷
npm run format
```

### 4.4. 테스트 실행

```bash
npm test
```


## 5. 데이터베이스 마이그레이션 (스키마 변경 시)

스키마를 변경했을 때:

```bash
# 개발 환경: 스키마 변경 사항을 데이터베이스에 즉시 반영
npm run db:push

# 프로덕션 환경: 마이그레이션 파일 생성
npm run db:migrate
```

**주의**: 프로덕션 DB (Render)를 사용하므로 스키마 변경 시 팀원들과 협의 필요!

## 6. 문제 해결

### 6.1. DevContainer 연결 실패

```bash
# DevPod 재시작
devpod down .
devpod up .
```

### 6.2. 데이터베이스 연결 오류

```bash
# DATABASE_URL 확인
echo $DATABASE_URL

# Render DB가 슬립 모드인 경우 첫 연결이 느릴 수 있음 (10-30초 대기)
```

### 6.3. Prisma Client 오류

```bash
# Prisma Client 재생성
npm run db:generate

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

### 6.4. 포트 충돌

```bash
# 포트 3000이 이미 사용 중인 경우
# .env 파일에서 PORT 변경
PORT=3001
```

## 7. 코드 포맷팅 규칙

### 7.1. 자동 포맷팅 (DevContainer 사용 시)

DevContainer에서는 파일 저장 시 자동으로 다음 작업이 수행됩니다:

- **Prettier**: 코드 포맷팅
- **ESLint**: 자동 수정 가능한 오류 수정
- **EditorConfig**: 들여쓰기, 줄바꿈 설정 적용

### 7.2. 수동 포맷팅

```bash
# 모든 파일 포맷팅
npm run format

# 특정 파일만 포맷팅
npx prettier --write src/modules/auth/auth.controller.ts

# ESLint 자동 수정
npm run lint:fix
```

### 7.3. 포맷팅 규칙

- **들여쓰기**: 스페이스 2칸
- **세미콜론**: 사용 (`;`)
- **따옴표**: 싱글 쿼트 (`'`)
- **줄바꿈**: LF (Unix 스타일)
- **줄 길이**: 최대 100자
- **후행 쉼표**: ES5 스타일
- **화살표 함수**: 괄호 필수 `(x) => x`


## 8. 유용한 명령어 모음

```bash
# 개발 서버
npm run dev               # 개발 모드 실행 (Hot Reload)
npm run build             # TypeScript 빌드
npm start                 # 프로덕션 모드 실행

# 데이터베이스
npm run db:generate       # Prisma Client 생성
npm run db:push           # 스키마를 DB에 적용 (개발)
npm run db:migrate        # 마이그레이션 생성 (프로덕션)
npm run db:seed           # 샘플 데이터 삽입
npm run db:studio         # Prisma Studio 실행

# 코드 품질
npm run lint              # ESLint 검사
npm run lint:fix          # ESLint 자동 수정
npm run format            # Prettier 포맷
npm run format:check      # Prettier 검사
npm test                  # 테스트 실행

# Docker
docker-compose up -d      # 서비스 시작 (백그라운드)
docker-compose down       # 서비스 종료
docker-compose logs -f    # 로그 확인

# DevPod
devpod up .               # DevContainer 시작
devpod down .             # DevContainer 종료
devpod delete .           # DevContainer 삭제
```


# **🚀 MoonShot - 프로젝트 일정 관리 서비스**
- MoonShot은 복잡한 프로젝트 일정을 효율적으로 관리하고 팀원 간의 협업을 돕는 웹 서비스입니다. 
- 칸반 보드와 캘린더 뷰를 통해 프로젝트의 흐름을 한눈에 파악하고, 할 일(Task) 중심의 커뮤니케이션을 지원합니다.

관련 문서 : [Notion](https://candle-pumpkin-106.notion.site/NB07-Team-2-2f5440fb3f968040bcc8e7f7f7e7d4e3?pvs=74)
## **📅 프로젝트 정보**
- 진행 기간: 2026.01.28 ~ 2026.02.24
- 주요 목적: 중급 단계의 프로젝트 관리 및 API 협업 역량 강화
- 디자인 시안: [FigmaLink](https://www.figma.com/design/OXFYUG5ntETP4slCtj4lnu/Moonshot-BBB--%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%EC%9D%BC%EC%A0%95-%EA%B4%80%EB%A6%AC-%EC%84%9C%EB%B9%84%EC%8A%A4?node-id=117-1545)

## **👥 팀 구성 및 R&R이름**

| **이름**          | **역할**  | **담당 업무**                                                            |
| --------------- | ------- | -------------------------------------------------------------------- |
| **김승철 (팀장)**    | Backend | 유저, 파일 업로드 API CRUD, 노션 문서화, Github 관리, <br>Github 자동화 수정, render 배포 |
| **강희성**         | Backend | 멤버, 하위 할 일 API CRUD                                                  |
| **구창민**         | Backend | 프로젝트, 할 일, 댓글 API CRUD                                               |
| **송형욱**( 중도하차 ) | Backend | 인증 API CRUD, 프로젝트 환경 세팅, DB 설계, <br>초기 Github 세팅 및 자동화 설정            |


## **🛠 기술 스택**
**Backend**
- Runtime: Node.js (Express)
- Language: TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Authentication: JWT, Google OAuth

**Tools**
- Communication: Discord (Webhook), Notion
- VCS: GitHub

## **✨ 핵심 기능**
#### 1. **인증 및 유저 관리**
	- 이메일 기반 회원가입 및 로그인 (비밀번호 해싱 적용)
	- 구글 소셜 로그인 지원
	- 프로필 이미지 및 개인정보 수정 기능

#### 2. **프로젝트 관리**
	- 프로젝트 생성(인당 최대 5개), 수정, 삭제 기능
	- 프로젝트 삭제 시 참여 멤버 대상 이메일 알림 전송
	- 최신순, 이름순 정렬 및 멤버 수/상태별 통계 조회

#### 3. **할 일 (Task) & 하위 할 일**
	- 할 일 등록, 상세 조회, 수정, 삭제 (파일 업로드 포함)
	- 담당자 지정, 태그, 마감 기한 설정
	- 하위 할 일(Sub-task) 생성 및 완료 체크 기능

#### 4. **대시보드 및 시각화**
	- Kanban Board: 상태별 할 일 드래그 앤 드롭 관리 및 필터링
	- Calendar View: 월별 일정 조회 및 상세 필터링 기능

#### 5. **협업 및 댓글**
	- 이메일을 통한 프로젝트 초대 및 수락/취소 프로세스
	- 할 일 별 실시간 댓글 소통

## **📂 프로젝트 구조**
	##### **- Layered Architecture를 적용하여 관심사를 분리하고 유지보수성을 높였습니다.**

`backend/`
`├── prisma/             # Database Schema`
`├── scripts             # test code`
`├── uploads             # File Upload 저장`  
`├── src/`
`│   ├── app.ts          # main 실행 파일`
`│   ├── __tests__       # Test 데이터`
`│   ├── classes`
`│   │    └── dto        # 관심사 분리를 위한 dto`
`│   ├── controllers/    # HTTP 요청 처리 및 응답`
`│   ├── services/       # 비즈니스 로직`
`│   ├── repositories/   # DB 접근 로직 ( Prisma )`
`│   ├── middlewares/    # 인증 및 에러 처리`
`│   ├── routes/         # 엔드포인트 정의`
`│   ├── lib/            # 공통 유틸리티 ( 인증, 에러 등 )`
`│   ├── schemas/        # 검증을 위한 별도 스키마`
`│   ├── utils/          # async Handler`
`│   ├── validators      # 하위 할 일 별도 검증 파일`
`│   └── types/          # 타입 정의 파일`

## **🚀 시작하기**
#### 1. **저장소 클론**
```Bash
git clone https://github.com/nb07-Moonshot-Team2/NB07_Moonshot_Team2.git
cd moonshot
```

#### 2. **Backend 설정 및 실행**
```Bash
cd backend
npm install
# .env 파일 생성 및 DB URL, JWT_SECRET 설정 필요
npm run dev
```

#### 3. **Frontend 설정 및 실행**
```Bash
cd ../frontend
npm install
npm run dev
```

## ⚠️ 개발 규칙 및 주의사항

- **Git**: `main`, `develop` 브랜치 Github 브랜치 관리자( 김승철 )외 직접 수정 금지 
		( PR 기반 협업 )
- **DB**: `Schema.prisma` 수정 시 팀 내 사전 논의 필수
- **에러 처리**: `Custom Error Class`를 통한 통합 에러 핸들링 준수 
- **무결성**: 트랜잭션 및 캐스캐이딩 삭제를 통한 데이터 무결성 보장

## **🚨 프로젝트 중 발생한 문제점**
###### 1. 프로젝트 환경 세팅 후 패키지 버전 이슈
###### 2. Github pull/rebase 이슈로 기능 구현 지연
###### 3. 일정 분배 실수로 마감까지 촉박


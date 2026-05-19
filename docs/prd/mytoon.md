# MyToon — 인스타툰/SNS 만화 제작 올인원 웹 앱 PRD

## 1. 문제 정의

- **누가**: 그림을 그릴 줄 모르는 일반인 (인스타그램·SNS 사용자)
- **어떤 상황에서**: 자기 경험·생각·아이디어를 인스타툰 형태로 공유하고 싶지만, 그림 실력이 없어서 포기하는 상황
- **무엇이 불편한가**:
  - 기존 도구(캔바, 미드저니 등)는 만화 워크플로 특화 X
  - 캐릭터 일관성 유지가 어려움 (매 컷마다 다른 그림체)
  - 컷 분할·말풍선·대사 배치 등 수작업 부담
  - 한 줄 아이디어를 완성된 4컷 만화로 만드는 통합 흐름 부재

## 2. 해결 방안

### 한 줄 요약
한 줄 입력 → AI 가 가변 컷 만화를 자동 생성하고, 등록된 캐릭터로 일관성 유지하며, 풀 편집기로 자유롭게 다듬는 올인원 웹 앱.

### 핵심 아이디어
1. **AI 자동 생성 + 수동 조립 하이브리드**: 한 줄 줄거리로 AI 가 4/6/10컷 자동 생성. 그 위에 템플릿·말풍선·캐릭터 드래그로 보강.
2. **캐릭터 1회 등록 → 모든 컷 재사용**: 사진 업로드/텍스트 설명/프리셋 선택 중 택일. img2img(DALL-E 3 edit) 로 일관성 유지.
3. **풀 편집기**: 말풍선·텍스트·위치 조정뿐 아니라 컷 단위 재생성, 부분 inpainting, 브러시·레이어까지.
4. **크레딧 기반 수익화**: 신규 가입 무료 크레딧, 컷 1개 = 크레딧 1개. 토스페이먼츠/포트원 결제. 관리자는 무제한.

### 왜 이 방식인가 (대안 검토)
- **AI 엔진**: 자체 SD 호스팅 대신 DALL-E 3 API 선택. 운영 부담↓, 품질·안정성↑.
- **캐릭터 일관성**: LoRA 학습 대신 reference image + img2img. 학습 시간/비용 없이 즉시 사용.
- **MVP 범위**: 좁은 MVP 대신 전체 기능 한 번에. 풀 편집기 없이는 "올인원" 가치 제공 불가 판단.
- **인증**: 소셜 로그인 대신 이메일+비밀번호. 외부 의존성 최소화.

## 3. 사용자 스토리

### US-1: 회원가입·로그인
사용자로서, 이메일+비밀번호로 가입·로그인하여 내 작품을 클라우드에 저장할 수 있다.
- 수용 기준: 이메일 인증, 비밀번호 재설정, 가입 시 무료 크레딧 N개 자동 지급.

### US-2: 캐릭터 등록
사용자로서, 3가지 방식 중 하나로 캐릭터를 등록할 수 있다.
- (a) 사진 업로드 → AI 가 캐릭터화
- (b) 텍스트로 외모 설명 입력
- (c) 프리셋 캐릭터 라이브러리에서 선택 + 커스터마이즈
- 수용 기준: 등록한 캐릭터는 내 라이브러리에 저장되어 모든 신규 프로젝트에서 재사용 가능.

### US-3: AI 자동 4/6/10컷 생성
사용자로서, 한 줄 줄거리와 컷 수를 입력하면 AI 가 자동으로 컷별 이미지·대사를 생성한다.
- 수용 기준: 컷 수는 사용자가 자유 선택. 등록된 캐릭터가 모든 컷에 일관되게 등장.

### US-4: 컷별 직접 입력 모드
사용자로서, 각 컷마다 직접 한 줄씩 시나리오를 입력해 생성할 수 있다.
- 수용 기준: 자동 생성 모드와 토글 가능.

### US-5: 컷 레이아웃 선택
사용자로서, 그리드 모양(2x2, 1x4 세로, 2x3 등)을 직접 선택할 수 있다.

### US-6: 풀 편집기
사용자로서, 생성된 작품에 대해 다음 편집을 수행할 수 있다.
- 말풍선·텍스트·캐릭터 위치/크기 조정
- 컷 단위 재생성 (크레딧 차감, 무제한 가능)
- 부분 inpainting
- 브러시·레이어·필터
- 수용 기준: 말풍선 종류·폰트 라이브러리가 풍부하게 제공됨 (수십 종).

### US-7: 작품 관리
사용자로서, 내 서랍에서 프로젝트별 폴더로 작품을 관리하고, 30초 자동 저장 + 최근 N개 버전 히스토리를 사용할 수 있다.

### US-8: Export
사용자로서, 완성작을 PNG/JPG 다운로드하거나 클립보드로 복사해 외부 SNS 에 공유할 수 있다.
- 수용 기준: 인스타 1:1 정사각 캐러셀 형식 우선.

### US-9: 크레딧 충전
사용자로서, 토스페이먼츠/포트원으로 크레딧을 충전할 수 있다.
- 수용 기준: 1 크레딧 = 컷 1개 생성. 잔액·이력 조회 가능.

### US-10: 관리자 어드민
관리자(주인)로서, 다음을 수행한다.
- 사용자/작품/신고 관리
- 사용자에게 크레딧 수동 부여
- 프리셋 캐릭터 라이브러리 관리(등록/수정/삭제)
- 본인 계정은 크레딧 무제한

### US-11: 신고 기능
사용자로서, 부적절한 작품·캐릭터를 신고할 수 있다.
- 수용 기준: 외부 API 의 기본 콘텐츠 필터 + 자체 신고 큐 → 관리자 검토.

## 4. 구현 결정

### 스택
- **프론트엔드**: Next.js (App Router) + TypeScript + Tailwind CSS
- **DB**: PostgreSQL
- **스토리지**: AWS S3 또는 Cloudflare R2
- **AI**: OpenAI DALL-E 3 API (img2img / edit 지원)
- **결제**: 토스페이먼츠 또는 포트원
- **인증**: 자체 이메일+비밀번호 (NextAuth 또는 직접 구현)

이유: Next.js 풀스택 + Postgres 조합으로 SSR/API/DB 일원화. S3/R2 는 이미지 비용 효율. DALL-E 3 는 한국어 프롬프트 품질·안정성 우수.

### 데이터 모델 (개략)

```
User
  - id, email, password_hash, credit_balance, role(admin|user), created_at

Character
  - id, user_id, name, source_type(photo|text|preset), reference_image_url,
    description_prompt, created_at

Project
  - id, user_id, title, cut_count, layout_type, status, created_at, updated_at

Cut
  - id, project_id, order_index, image_url, prompt, character_ids[]

Bubble
  - id, cut_id, type(speech|thought|shout|narration|sfx), text, font, x, y, w, h

ProjectVersion
  - id, project_id, snapshot_json, created_at  (최근 N개 유지)

CreditTransaction
  - id, user_id, delta, reason(signup|purchase|generation|admin), created_at

Report
  - id, reporter_id, target_type(project|character), target_id, reason, status, created_at

PresetCharacter
  - id, name, reference_image_url, description_prompt, created_by_admin
```

### API 엔드포인트 (개략)
- `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/reset-password`
- `GET/POST /api/characters`, `PATCH/DELETE /api/characters/:id`
- `GET/POST /api/projects`, `PATCH/DELETE /api/projects/:id`
- `POST /api/projects/:id/generate` (전체 자동 생성)
- `POST /api/projects/:id/cuts/:cutId/regenerate` (단일 컷 재생성)
- `POST /api/projects/:id/cuts/:cutId/inpaint`
- `POST /api/projects/:id/export` (PNG/JPG)
- `GET /api/credits`, `POST /api/credits/purchase`, `POST /api/credits/webhook`
- `POST /api/reports`
- `GET/POST /api/admin/*` (사용자·신고·크레딧·프리셋 관리)

### UI 화면 흐름
1. 랜딩 → 가입/로그인
2. 내 서랍 (프로젝트 목록) → 새 프로젝트
3. 캐릭터 등록/선택
4. 시나리오 입력 (자동/컷별) + 컷 수·레이아웃 선택
5. AI 생성 진행 (응답 30초 이내 목표)
6. 풀 편집기 (말풍선·재생성·inpainting·브러시·레이어)
7. Export (다운로드/클립보드)
8. 어드민 (별도 라우트 `/admin`)

### 인증·권한
- 일반 user: 자기 작품·캐릭터만 접근, 크레딧 잔액으로 생성
- admin: 전 사용자 데이터 조회, 크레딧 무제한, 프리셋·신고 관리

### 외부 의존성
- OpenAI DALL-E 3 API (이미지 생성)
- 토스페이먼츠/포트원 (결제)
- AWS S3 또는 Cloudflare R2 (이미지 스토리지)
- 이메일 발송 서비스 (인증·재설정 메일) — TBD

## 5. 테스트 결정

### 단위 테스트
- 크레딧 차감 로직 (정확성)
- 권한 체크 (user vs admin, 소유권)
- 데이터 모델 validator

### 통합/E2E
- 가입 → 캐릭터 등록 → 4컷 생성 → 편집 → 다운로드 (골든 패스)
- 크레딧 부족 시 생성 차단
- 컷 재생성 시 크레딧 차감
- 관리자 무제한 동작
- 결제 webhook 검증

### 수동 QA 시나리오
- 6컷/10컷 가변 생성
- 컷별 직접 입력 모드
- 부분 inpainting UX
- 자동 저장·버전 복원
- 신고 → 어드민 큐 노출

### 성공 지표 측정
- WAU (주간 활성 사용자) — DB `last_active_at` 기반 집계
- 작품 생성 수 — `Project` count, `Cut` count
- 어드민 대시보드에 노출

## 6. 범위 외 (Out of Scope)

- **협업 편집** (실시간/링크 공유 편집)
- **공개 갤러리** (앱 내 좋아요/구독)
- **다국어** (한국어 only)
- **모바일 우선 UX** (PC 우선, 모바일 반응형만)
- **소셜 로그인** (구글/카카오)
- **인스타·트위터 직접 게시 API**
- **자체 LoRA 캐릭터 학습**
- **풍부한 콘텐츠 자체 필터링 레이어** (외부 API 기본 필터 + 신고로 대응)
- **세로 스크롤 웹툰 포맷** (1:1 정사각 우선)

## 7. 오픈 이슈

- 신규 가입 무료 크레딧 정확한 수량 (예: 30 / 50 / 100 중) — TBD
- 버전 히스토리 보관 개수 N — TBD (예: 10개)
- 이메일 발송 서비스 선정 (Resend / SES / SMTP) — TBD
- DALL-E 3 응답 30초 초과 시 비동기 큐 도입 여부 — TBD
- 결제 게이트웨이 최종 선정 (토스페이먼츠 vs 포트원) — TBD
- 말풍선/폰트 라이브러리 초기 수량과 라이선스 — TBD

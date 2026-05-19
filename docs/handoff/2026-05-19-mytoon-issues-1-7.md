# 인수인계: MyToon 이슈 #1~#7 완료

작성일: 2026-05-19
이전 세션 작업 범위: 인스타툰 올인원 웹 앱 (MyToon) — 이슈 #1~#7 구현 + simplify 중간 점검

---

## 1. 현재 상태

- 진행 중 이슈: 없음 (다음: #8)
- 현재 브랜치: `main` (직접 커밋 규칙 — 별도 브랜치 금지)
- 마지막 커밋: `11c95c7` feat: 컷 재생성 + 인페인팅 + undo 기능 (#7)
- 빌드/테스트 상태: `npm run lint && npm run build` **pass**

---

## 2. 무엇이 완료됐나

| 이슈 | 내용 | 주요 파일 |
|------|------|-----------|
| #1 | 프로젝트 셋업 (Next.js 16 + TS + Tailwind + Prisma v7 + S3 래퍼) | `prisma/schema.prisma`, `src/lib/` |
| #2 | 이메일+비밀번호 인증, JWT 쿠키, 크레딧 50개 지급 | `src/app/api/auth/`, `src/lib/auth.ts`, `src/lib/credits.ts` |
| #3 | 캐릭터 등록 3가지 방식 (사진/텍스트/프리셋) | `src/app/api/characters/`, `src/components/CharacterWizard.tsx` |
| #4 | AI 자동 생성 (GPT-4o 시나리오 → DALL-E 3 이미지), 가변 컷 수, 그리드 레이아웃 | `src/app/api/projects/[id]/generate/route.ts` |
| #5 | 컷별 직접 입력 모드 (자동/직접 토글, 빈 컷 AI 보강) | `src/app/dashboard/new/page.tsx` |
| #6 | 편집기 — react-konva 캔버스, 말풍선 5종, 드래그/리사이즈/회전, z-order | `src/components/editor/`, `src/app/dashboard/projects/[id]/edit/page.tsx` |
| #7 | 컷 재생성 + gpt-image-1 인페인팅 + 1단계 undo | `src/app/api/projects/[id]/cuts/[cutId]/regenerate|inpaint|undo/route.ts` |
| - | simplify 중간 점검 적용 (보안·원자성·코드 품질) | 여러 파일 |

---

## 3. 무엇이 남았나 (다음 액션)

- [ ] **#8** 편집기 — 브러시·레이어·필터 (선행: #7 완료됨)
- [ ] **#9** 작품 서랍 + 30초 자동 저장 + 버전 히스토리 (선행: #6 완료됨)
- [ ] **#10** Export — PNG/JPG 다운로드·클립보드 (선행: #6 완료됨)
- [ ] **#11** 크레딧 충전 — 토스페이먼츠 연동 (선행: #2 완료됨)
- [ ] **#12** 관리자 어드민 — 사용자/작품/크레딧/프리셋 관리 (선행: #3, #11)
- [ ] **#13** 신고 기능 (선행: #12)
- [ ] **#14** 통계 대시보드 WAU (선행: #12)

**추천 순서**: #8 → #9 → #10 → #11 → #12 → #13 → #14

---

## 4. 핵심 결정 사항

- **Prisma v7**: `url` 필드가 `schema.prisma`가 아닌 `prisma.config.ts`의 `datasource.url`에 있음. DB 어댑터는 `@prisma/adapter-pg`의 `PrismaPg` 사용. 생성 경로: `src/generated/prisma/client`.

- **JWT 세션**: `jose` 라이브러리, `httpOnly` 쿠키 (`mytoon_session`). `src/lib/auth.ts`에 `sessionCookieOptions()` / `logoutCookieOptions()` 헬퍼 있음. 프로덕션에서 `JWT_SECRET` 미설정 시 startup throw.

- **크레딧 차감**: `src/lib/credits.ts` — 잔액 확인과 차감이 하나의 트랜잭션 내부에서 atomic하게 처리됨 (check-then-act 방지).

- **이미지 편집 (인페인팅)**: 이미지 처리 라이브러리(sharp/jimp) 미도입. gpt-image-1 edit endpoint에 이미지만 전달, mask는 UI 시각적 표시용으로만 사용. 추후 마스크 실제 적용 시 `sharp` 추가 필요.

- **react-konva**: SSR 불가 → `dynamic(() => import(...), { ssr: false })`. Transformer 노드는 render가 아닌 `useEffect` 안에서 연결 (ESLint 규칙).

- **ESLint 규칙**: `react-hooks/set-state-in-effect` 엄격 적용. useEffect 내 fetch 후 `cancelled` 플래그 패턴 사용. 대안으로 `refreshKey` 카운터 state 패턴도 사용 중 (`src/app/dashboard/characters/page.tsx`).

- **모든 커밋**: `main` 브랜치 직접 커밋. 별도 브랜치 금지.

---

## 5. 함정·주의사항

1. **DB 없는 원격 환경**: Docker 없음 → `npx prisma migrate dev` 실패. 마이그레이션 SQL을 `prisma/migrations/<timestamp>_<name>/migration.sql`에 수동 생성 후 `npx prisma generate`만 실행.

2. **Bubble 모델 미완**: `Bubble` DB 스키마에 `color`, `fontSize`, `bold`, `rotation`, `zIndex` 컬럼 없음. 현재 저장 시 무시되고 로드 시 하드코딩 기본값 사용. 향후 #8이나 #9에서 보강 필요.

3. **인페인팅 마스크**: `CanvasEditor`의 `maskMode`가 true일 때 HTML canvas 오버레이가 표시되어 브러시 드로잉 가능하지만, 그려진 마스크는 API에 전달되지 않음. 프롬프트만 gpt-image-1에 전달됨.

4. **`hasPrevious` 파생 필드**: `edit/page.tsx`의 `Cut` 타입에 `hasPrevious: boolean` 필드가 있으나, API에서 `previousImageUrl`의 존재 여부로 프론트에서 계산. DB의 `Cut` 모델에는 없는 필드.

5. **characterImages prop**: `EditorPanel`은 `characterImages` prop을 받지만 현재 "캐릭터 추가" 시 항상 `characters[0]`만 추가 (멀티 선택 UI 미구현). #8에서 개선 가능.

6. **프로젝트 GET API**: `src/app/api/projects/[id]/route.ts` 가 cuts+bubbles를 포함해 반환하지만, `previousImageUrl`은 현재 포함되어 반환됨. `hasPrevious` 계산은 `edit/page.tsx:load()`에서 처리.

---

## 6. 참조 문서

- PRD: `docs/prd/mytoon.md`
- GitHub 이슈: keehoon924/mytoon #1~#14
- 핵심 라이브러리 설정: `prisma.config.ts`, `src/lib/prisma.ts`
- 편집기 타입 정의: `src/components/editor/types.ts`
- OpenAI 유틸: `src/lib/openai.ts`
- 스토리지 유틸: `src/lib/storage.ts`
- 인증: `src/lib/auth.ts`
- 크레딧: `src/lib/credits.ts`

---

## 7. 새 세션 시작 시 첫 명령

"MyToon 웹앱 개발 중. 이슈 #1~#7 완료, main 브랜치에 직접 커밋. 다음은 이슈 #8 (편집기 브러시·레이어·필터). 주의사항: DB 없는 환경이라 마이그레이션은 SQL 파일 수동 생성 + npx prisma generate. Prisma v7 사용 중. 모든 커밋은 main에 직접. 한국어 caveman 모드. `docs/handoff/2026-05-19-mytoon-issues-1-7.md` 참조. 이슈 #8부터 작업 시작해줘."

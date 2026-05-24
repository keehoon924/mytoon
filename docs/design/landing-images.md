# 랜딩 페이지 이미지 명세

> 워크플로: 이 명세대로 GPT/미드저니에서 생성 → 전달 → 배치.
> 파일: PNG. 저장 위치: `public/illustrations/`. 파일명은 아래 ID 그대로.
> **공통 스타일(전부 적용)**: 따뜻한 손그림 디지털 일러스트, 크림(#F7F3EA) 배경, 세이지그린(#7C8B5B)·머스타드(#D4A24E)·웜브라운 팔레트, 둥근 깔끔한 라인, 2.5~3등신 귀여운 캐릭터, 부드러운 자연광, 단순한 배경, **네온·블루톤·3D·과한 광택 금지**.

| ID | 개수 | 비율(권장 px) | 배경 | 내용 | 우선 |
|----|------|----------------|------|------|------|
| `hero-comic.png` | 1 | 1:1 (1080²) | 크림 | 4컷(2×2) 인스타툰 한 편. 한 캐릭터의 성장/일상 이야기 (예: 가계부→투자→공부→경제적 자유) | ★필수 |
| `sample-1~6.png` | 6 | 1:1 (1080²) | 크림 | 완성된 인스타툰 샘플(서로 다른 주제: 일상·재테크·힐링·직장·여행·취미) | ★1~3 필수 |
| `character-1~6.png` | 6 | 1:1 (600²) | 투명 | 캐릭터 반신: 1~3 여성, 4 남성, 5 강아지, 6 토끼 | ★1~3 필수 |
| `template-1~4.png` | 4 | 4:5 (800×1000) | 크림 | 폰 화면 속 인스타툰 레이아웃 미리보기 (기본4컷/세로스토리/말풍선강조/노트정리) | 보통 |
| `cta-group.png` | 1 | 16:10 (1200×750) | 투명 | 캐릭터 3~4명 + 강아지가 노트북 보며 함께 작업하는 따뜻한 장면 | 보통 |

**최소 세트(이것만 와도 톤 확인 가능)**: `hero-comic` + `sample-1~3` + `character-1~3`

---

## 생성 프롬프트 (영어, 복붙용)

**hero-comic.png** (히어로 메인 4컷)
```
A 4-panel (2x2 grid) Korean instagram webtoon, warm cozy hand-drawn digital illustration,
soft cream (#F7F3EA) background, sage green and mustard and warm brown palette,
rounded clean lineart, cute character with 3-head proportion, soft diffuse lighting,
a heartwarming story about building good habits (writing a budget, starting to invest,
studying steadily, achieving financial freedom), gentle expressions, simple backgrounds,
Korean speech bubbles, no neon, no blue tones, no 3D, no glossy render
```

**sample-N.png** (완성 샘플 — 주제만 바꿔서 6개)
```
A single Korean instagram webtoon page, warm cozy hand-drawn style, cream background,
sage/mustard/brown palette, rounded lineart, cute 3-head proportion character,
topic: [일상 / 재테크 / 힐링 / 직장생활 / 여행 / 취미], soft lighting, simple background,
emotional instagram comic, no neon, no 3D
```

**character-N.png** (캐릭터, 투명배경)
```
A single cute Korean webtoon character, upper body, transparent background,
warm hand-drawn style, sage/mustard/brown palette, rounded clean lineart,
3-head proportion, friendly gentle expression, [젊은 여성 / 젊은 남성 / 강아지 / 토끼],
soft shading, no neon, no 3D, sticker style cutout
```

**template-N.png** (템플릿 미리보기)
```
A smartphone screen mockup showing an instagram webtoon layout preview,
[2x2 four-panel grid / vertical story strip / dialogue-focused panels / note-style layout],
warm cream UI, sage accents, cute placeholder webtoon panels inside, clean flat illustration,
soft shadow, no text needed
```

**cta-group.png** (그룹 일러스트, 투명배경)
```
A warm cozy illustration of 3-4 cute Korean webtoon characters and a small dog
working together around a laptop, hand-drawn style, transparent background,
sage/mustard/brown palette, rounded lineart, 3-head proportion, happy collaborative mood,
soft lighting, no neon, no 3D
```

-- Seed beta preset characters
-- Images are placeholder SVG data URLs; replace with real artwork before launch.

INSERT INTO "PresetCharacter" ("id", "name", "referenceImageUrl", "descriptionPrompt", "createdAt", "updatedAt")
VALUES
  (
    'preset_beta_01',
    '수진 (감성 직장인)',
    'https://placehold.co/512x512/E8F0EB/7CAF8A?text=수진',
    'A Korean office worker woman in her late 20s with straight black shoulder-length hair and glasses. Wears neat casual office attire. Expressive round eyes, slim face. Webtoon style, clean lineart.',
    NOW(), NOW()
  ),
  (
    'preset_beta_02',
    '민준 (개그맨 친구)',
    'https://placehold.co/512x512/FFF3E0/F97316?text=민준',
    'A cheerful Korean man in his late 20s with short messy hair and a wide smile. Round face, chubby cheeks, often making funny expressions. Casual streetwear. Webtoon style, bold outlines.',
    NOW(), NOW()
  ),
  (
    'preset_beta_03',
    '하늘 (감성 고등학생)',
    'https://placehold.co/512x512/EEF2FF/6366F1?text=하늘',
    'A Korean high school girl with twin tails hair and big expressive eyes. School uniform with cute accessories. Innocent look, slightly shy expression. Webtoon style, soft lines.',
    NOW(), NOW()
  ),
  (
    'preset_beta_04',
    '도그 (강아지 캐릭터)',
    'https://placehold.co/512x512/FEF3C7/D97706?text=도그',
    'A cute cartoon golden retriever dog character with big round eyes and a happy smile. Chibi proportions, fluffy fur. Expressive, anthropomorphic postures. Webtoon style.',
    NOW(), NOW()
  ),
  (
    'preset_beta_05',
    '지우 (카페 사장님)',
    'https://placehold.co/512x512/FCE7F3/DB2777?text=지우',
    'A Korean woman in her early 30s with wavy brown hair and a warm smile. Wears a coffee shop apron. Calm, reliable expression. Webtoon style, clean pastel tones.',
    NOW(), NOW()
  ),
  (
    'preset_beta_06',
    '태양 (운동 유튜버)',
    'https://placehold.co/512x512/ECFDF5/10B981?text=태양',
    'A fit Korean man in his late 20s with short stylish hair and an energetic expression. Sports wear, muscular but friendly looking. Confident pose. Webtoon style, dynamic lines.',
    NOW(), NOW()
  ),
  (
    'preset_beta_07',
    '나비 (고양이 캐릭터)',
    'https://placehold.co/512x512/F5F3FF/8B5CF6?text=나비',
    'A cute cartoon white cat character with purple eyes and a mysterious smile. Elegant, slightly smug expression. Chibi proportions with fluffy tail. Webtoon style.',
    NOW(), NOW()
  ),
  (
    'preset_beta_08',
    '재원 (IT 스타트업 대표)',
    'https://placehold.co/512x512/EFF6FF/3B82F6?text=재원',
    'A Korean man in his early 30s with trendy undercut hair and a sharp intelligent look. Wears a simple t-shirt and blazer. Confident, slightly nerdy vibe. Webtoon style.',
    NOW(), NOW()
  )
ON CONFLICT ("id") DO NOTHING;

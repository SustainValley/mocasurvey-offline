export const TOTAL_CAFES = 3;
export const POSTS_PER_CAFE = 6;
export const TOTAL_SECONDS = 60;
export const CORRECT_KEYWORDS_PER_CAFE = 3;
export const TOTAL_CORRECT_KEYWORDS = TOTAL_CAFES * CORRECT_KEYWORDS_PER_CAFE;

// 카페별 정답 키워드입니다. 정답을 바꿀 때는 이 객체만 수정하면 됩니다.
export const CORRECT_KEYWORDS = Object.freeze({
  1: Object.freeze(["따뜻한", "아늑한", "친근한"]),
  2: Object.freeze(["커피중심", "장인정신", "자연스러운"]),
  3: Object.freeze(["디저트", "트렌디한", "감성적인"]),
});

// 정답 9개 + 혼동용 키워드 18개 = 총 27개입니다.
// 배열 순서는 참가자 화면에서 보이는 순서이므로 정답이 한곳에 몰리지 않게 섞어둡니다.
export const KEYWORDS = Object.freeze([
  "차분한", "따뜻한", "전문적인", "디저트", "미니멀한",
  "트렌디한", "고급스러운", "아늑한", "빈티지한",
  "커피중심", "힙한", "자연스러운", "선명한", "친근한",
  "부드러운", "로컬한", "장인정신", "세련된",
  "감성적인", "편안한", "개성있는", "담백한",
  "신뢰감", "공간중심", "이야기", "계절감", "색감",
]);

export const CAFES = Object.freeze(
  Array.from({ length: TOTAL_CAFES }, (_, cafeIndex) => ({
    id: cafeIndex + 1,
    posts: Array.from(
      { length: POSTS_PER_CAFE },
      (_, postIndex) => `/offline-feeds/cafe-${String(cafeIndex + 1).padStart(2, '0')}/post-${String(postIndex + 1).padStart(2, '0')}.webp`,
    ),
  })),
);

export function scoreKeywordAnswers(answers = []) {
  const byCafe = Array.from({ length: TOTAL_CAFES }, (_, index) => {
    const cafeId = index + 1;
    const selected = Array.isArray(answers[index]) ? answers[index] : [];
    const correctSet = new Set(CORRECT_KEYWORDS[cafeId] || []);
    const correctCount = selected.filter((keyword) => correctSet.has(keyword)).length;

    return {
      cafeId,
      correctCount,
      total: CORRECT_KEYWORDS_PER_CAFE,
    };
  });

  const correctCount = byCafe.reduce((sum, cafe) => sum + cafe.correctCount, 0);
  const accuracy = TOTAL_CORRECT_KEYWORDS
    ? Math.round((correctCount / TOTAL_CORRECT_KEYWORDS) * 100)
    : 0;

  return {
    correctCount,
    totalCorrect: TOTAL_CORRECT_KEYWORDS,
    accuracy,
    byCafe,
  };
}

const uniqueCorrectKeywords = new Set(Object.values(CORRECT_KEYWORDS).flat());

if (KEYWORDS.length !== 27 || new Set(KEYWORDS).size !== 27) {
  throw new Error(`Offline keyword configuration must contain exactly 27 unique keywords. Current: ${KEYWORDS.length}`);
}

if (uniqueCorrectKeywords.size !== TOTAL_CORRECT_KEYWORDS) {
  throw new Error('Cafe answer keys must contain 9 unique correct keywords.');
}

if ([...uniqueCorrectKeywords].some((keyword) => !KEYWORDS.includes(keyword))) {
  throw new Error('Every correct keyword must exist in the 27-keyword option list.');
}

if (Object.values(CORRECT_KEYWORDS).some((keywords) => keywords.length !== CORRECT_KEYWORDS_PER_CAFE)) {
  throw new Error('Each cafe must have exactly 3 correct keywords.');
}

if (CAFES.length !== TOTAL_CAFES || CAFES.some((cafe) => cafe.posts.length !== POSTS_PER_CAFE)) {
  throw new Error('Offline cafe feed configuration is incomplete.');
}

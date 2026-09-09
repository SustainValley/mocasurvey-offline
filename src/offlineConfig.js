export const TOTAL_CAFES = 3;
export const POSTS_PER_CAFE = 6;
export const TOTAL_SECONDS = 60;
export const SELECTIONS_PER_CAFE = 3;
export const ANSWER_KEYS_PER_CAFE = 4;
export const TOTAL_SCORE = TOTAL_CAFES * SELECTIONS_PER_CAFE;

export const CAFE_NAMES = Object.freeze({
  1: "아카시아",
  2: "서재의잔",
  3: "카페 스너들",
});

// 카페별 정답 키 4개 중 참가자가 고른 3개가 모두 포함되면 카페 만점(3/3)입니다.
export const CORRECT_KEYWORDS = Object.freeze({
  1: Object.freeze(["전문적인", "따뜻한", "로스터리", "핸드드립"]),
  2: Object.freeze(["고요한", "지적인", "어른스러운", "잔잔한"]),
  3: Object.freeze(["포근한", "친근한", "사랑스러운", "디저트 맛집"]),
});

// 세 카페에서 공통으로 사용하는 후보 27개입니다.
// 정답군 12개 + 오답/혼동 키워드 15개.
export const KEYWORDS = Object.freeze([
  "전문적인", "트렌디한", "고요한", "화려한", "포근한", "로스터리", "지적인", "럭셔리한", "친근한",
  "핸드드립", "강렬한", "어른스러운", "루프탑", "사랑스러운", "인더스트리얼한", "따뜻한", "네온사인", "잔잔한",
  "도회적인", "디저트 맛집", "브런치", "시크한", "포토존", "대형카페", "힙한", "라이브 공연", "키즈존",
]);

export const CAFES = Object.freeze(
  Array.from({ length: TOTAL_CAFES }, (_, cafeIndex) => ({
    id: cafeIndex + 1,
    name: CAFE_NAMES[cafeIndex + 1],
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
      cafeName: CAFE_NAMES[cafeId],
      correctCount,
      total: SELECTIONS_PER_CAFE,
    };
  });

  const correctCount = byCafe.reduce((sum, cafe) => sum + cafe.correctCount, 0);
  const accuracy = TOTAL_SCORE
    ? Math.round((correctCount / TOTAL_SCORE) * 100)
    : 0;

  return {
    correctCount,
    totalCorrect: TOTAL_SCORE,
    accuracy,
    byCafe,
  };
}

const uniqueCorrectKeywords = new Set(Object.values(CORRECT_KEYWORDS).flat());

if (KEYWORDS.length !== 27 || new Set(KEYWORDS).size !== 27) {
  throw new Error(`Offline keyword configuration must contain exactly 27 unique keywords. Current: ${KEYWORDS.length}`);
}

if (uniqueCorrectKeywords.size !== TOTAL_CAFES * ANSWER_KEYS_PER_CAFE) {
  throw new Error('Cafe answer keys must contain exactly 12 unique correct keywords.');
}

if ([...uniqueCorrectKeywords].some((keyword) => !KEYWORDS.includes(keyword))) {
  throw new Error('Every correct keyword must exist in the 27-keyword option list.');
}

if (Object.values(CORRECT_KEYWORDS).some((keywords) => keywords.length !== ANSWER_KEYS_PER_CAFE)) {
  throw new Error('Each cafe must have exactly 4 answer-key keywords.');
}

if (CAFES.length !== TOTAL_CAFES || CAFES.some((cafe) => cafe.posts.length !== POSTS_PER_CAFE)) {
  throw new Error('Offline cafe feed configuration is incomplete.');
}

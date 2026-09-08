export const KEYWORDS = Object.freeze([
  "따뜻한", "차분한", "감성적인", "전문적인", "정갈한",
  "아늑한", "트렌디한", "친근한", "미니멀한", "고급스러운",
  "빈티지한", "힙한", "자연스러운", "선명한", "부드러운",
  "로컬한", "세련된", "편안한", "개성있는", "담백한",
  "신뢰감", "장인정신", "디저트", "커피중심", "공간중심",
  "이야기", "계절감", "색감", "정성", "취향",
  "활기찬", "조용한", "밝은", "포근한", "깔끔한",
  "감각적인", "모던한", "클래식한", "캐주얼한", "독특한",
  "여유로운", "특별한", "사진찍기좋은", "머물고싶은", "실험적인",
]);

export const TOTAL_CAFES = 3;
export const POSTS_PER_CAFE = 6;
export const TOTAL_SECONDS = 60;

export const CAFES = Object.freeze(
  Array.from({ length: TOTAL_CAFES }, (_, cafeIndex) => ({
    id: cafeIndex + 1,
    posts: Array.from(
      { length: POSTS_PER_CAFE },
      (_, postIndex) => `/offline-feeds/cafe-${String(cafeIndex + 1).padStart(2, '0')}/post-${String(postIndex + 1).padStart(2, '0')}.webp`,
    ),
  })),
);

if (KEYWORDS.length !== 45) {
  throw new Error(`Offline keyword configuration must contain exactly 45 keywords. Current: ${KEYWORDS.length}`);
}

if (CAFES.length !== TOTAL_CAFES || CAFES.some((cafe) => cafe.posts.length !== POSTS_PER_CAFE)) {
  throw new Error('Offline cafe feed configuration is incomplete.');
}

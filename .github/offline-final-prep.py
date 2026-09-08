from pathlib import Path
import re

main_path = Path('src/main.jsx')
text = main_path.read_text(encoding='utf-8')

store_import = 'import { checkOfflineEligibility, completeOfflineKeywordMatch } from "./offlineStore";\n'
config_import = 'import { CAFES, KEYWORDS, TOTAL_CAFES, TOTAL_SECONDS } from "./offlineConfig";\n'
if config_import not in text:
    if store_import not in text:
        raise SystemExit('offlineStore import not found')
    text = text.replace(store_import, store_import + config_import, 1)

pattern = r'''\nconst KEYWORDS = \[[\s\S]*?\nconst CAFES = Array\.from\(\{ length: TOTAL_CAFES \}, \(_, cafe\) => \(\{[\s\S]*?\n\}\)\);\n'''
text, count = re.subn(pattern, '\n', text, count=1)
if count != 1:
    raise SystemExit(f'config constants block replacement failed: {count}')

text = text.replace(
    '<img src={src} alt="" />',
    '<img src={src} alt="" loading="eager" decoding="async" />'
)
main_path.write_text(text, encoding='utf-8')

config = '''export const KEYWORDS = Object.freeze([\n  "따뜻한", "차분한", "감성적인", "전문적인", "정갈한",\n  "아늑한", "트렌디한", "친근한", "미니멀한", "고급스러운",\n  "빈티지한", "힙한", "자연스러운", "선명한", "부드러운",\n  "로컬한", "세련된", "편안한", "개성있는", "담백한",\n  "신뢰감", "장인정신", "디저트", "커피중심", "공간중심",\n  "이야기", "계절감", "색감", "정성", "취향",\n  "활기찬", "조용한", "밝은", "포근한", "깔끔한",\n  "감각적인", "모던한", "클래식한", "캐주얼한", "독특한",\n  "여유로운", "특별한", "사진찍기좋은", "머물고싶은", "실험적인",\n]);\n\nexport const TOTAL_CAFES = 3;\nexport const POSTS_PER_CAFE = 6;\nexport const TOTAL_SECONDS = 60;\n\nexport const CAFES = Object.freeze(\n  Array.from({ length: TOTAL_CAFES }, (_, cafeIndex) => ({\n    id: cafeIndex + 1,\n    posts: Array.from(\n      { length: POSTS_PER_CAFE },\n      (_, postIndex) => `/offline-feeds/cafe-${String(cafeIndex + 1).padStart(2, '0')}/post-${String(postIndex + 1).padStart(2, '0')}.webp`,\n    ),\n  })),\n);\n\nif (KEYWORDS.length !== 45) {\n  throw new Error(`Offline keyword configuration must contain exactly 45 keywords. Current: ${KEYWORDS.length}`);\n}\n\nif (CAFES.length !== TOTAL_CAFES || CAFES.some((cafe) => cafe.posts.length !== POSTS_PER_CAFE)) {\n  throw new Error('Offline cafe feed configuration is incomplete.');\n}\n'''
Path('src/offlineConfig.js').write_text(config, encoding='utf-8')

css_path = Path('src/styles.css')
css = css_path.read_text(encoding='utf-8')
marker = '/* FINAL-45-KEYWORD-LAYOUT */'
if marker not in css:
    css += '''\n\n/* FINAL-45-KEYWORD-LAYOUT */\n/* 45개 후보를 5열 × 9행으로 안정적으로 보여주고, 작은 화면에서는 패널 내부만 스크롤합니다. */\n.keyword-panel{\n  height:min(740px,calc(100svh - 138px));\n  min-height:620px;\n  padding:30px 34px 24px;\n}\n.panel-rule{margin:20px 0 22px}\n.keyword-grid{\n  grid-template-columns:repeat(5,minmax(0,1fr));\n  gap:7px 9px;\n  overflow-y:auto;\n  overscroll-behavior:contain;\n  scrollbar-width:thin;\n  padding:1px 3px 1px 0;\n}\n.keyword-grid button{\n  min-width:0;\n  height:38px;\n  padding:0 5px;\n  border-radius:10px;\n  font-size:12px;\n  white-space:nowrap;\n}\n.panel-actions{margin-top:16px}\n\n@media(max-width:1280px){\n  .keyword-panel{height:min(700px,calc(100svh - 132px));min-height:570px;padding:24px 26px 22px}\n  .panel-top h1{font-size:27px}\n  .panel-rule{margin:16px 0 17px}\n  .keyword-grid{gap:6px 7px}\n  .keyword-grid button{height:34px;font-size:11.5px}\n  .panel-actions{margin-top:13px}\n}\n\n@media(max-width:1024px){\n  .keyword-panel{height:min(640px,calc(100svh - 126px));min-height:530px;padding:20px}\n  .keyword-grid{gap:5px 6px}\n  .keyword-grid button{height:32px;font-size:10.5px;padding-inline:3px}\n}\n'''
css_path.write_text(css, encoding='utf-8')

readme = '''# CAFE MOCA Offline — final-swap ready\n\n이 저장소는 **사진만 교체하면 최종 배포할 수 있게** 구성되어 있습니다.\n\n## 최종 사진 슬롯\n\n화면은 3개 카페 × 6장 = 총 18장입니다. 아래 파일명은 코드에서 고정되어 있으므로 **파일 내용만 교체하고 이름은 유지**하면 됩니다.\n\n- `public/offline-feeds/cafe-01/post-01.webp` ~ `post-06.webp`\n- `public/offline-feeds/cafe-02/post-01.webp` ~ `post-06.webp`\n- `public/offline-feeds/cafe-03/post-01.webp` ~ `post-06.webp`\n\n권장: 정사각형(1:1), 720~1080px, WebP. 피드에서는 `object-fit: cover`로 표시됩니다.\n\n## 키워드\n\n`src/offlineConfig.js`에서 정확히 **45개**를 한 곳에서 관리합니다. 화면 코드는 키워드 배열을 직접 갖지 않습니다.\n\n## 배포 전 체크\n\n1. 사진 18장 교체\n2. `npm run build` 통과 확인\n3. `main`에 push\n4. Vercel 배포 상태 확인\n\nSupabase에는 각 카페에서 선택한 3개 키워드 문자열만 저장하므로, 후보 키워드가 30개에서 45개로 늘어나는 것 때문에 DB 스키마를 수정할 필요는 없습니다.\n'''
Path('README.md').write_text(readme, encoding='utf-8')

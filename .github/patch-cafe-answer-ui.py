from pathlib import Path

path = Path('src/main.jsx')
text = path.read_text(encoding='utf-8')

replacements = {
    '<AppHeader label="OFFLINE KEYWORD MATCH" badge={`총 ${TOTAL_CAFES}단계 · ${cafeIndex+1} / ${TOTAL_CAFES}`} />':
        '<AppHeader label="OFFLINE KEYWORD MATCH" badge={`${CAFES[cafeIndex]?.name || `카페 ${cafeIndex+1}`} · ${cafeIndex+1} / ${TOTAL_CAFES}`} />',
    '<p>총 9개의 정답 키워드 중 맞힌 개수예요.</p>':
        '<p>선택한 9개의 키워드 중 카페별 정답 키와 일치한 개수예요.</p>',
    '<span>카페 {cafe.cafeId}</span>':
        '<span>{cafe.cafeName || `카페 ${cafe.cafeId}`}</span>',
    '<p className="result-note">정답 키워드는 다음 참여자를 위해 공개하지 않아요.</p>':
        '<p className="result-note">각 카페는 정답 키 4개 중 어떤 3개를 골라도 만점이에요. 정답 키 자체는 다음 참여자를 위해 공개하지 않아요.</p>',
}

for old, new in replacements.items():
    if old not in text:
        raise SystemExit(f'Expected text not found: {old}')
    text = text.replace(old, new, 1)

path.write_text(text, encoding='utf-8')

from pathlib import Path

path = Path('src/main.jsx')
text = path.read_text(encoding='utf-8')
target = '          <p className="result-note">각 카페는 정답 키 4개 중 어떤 3개를 골라도 만점이에요. 정답 키 자체는 다음 참여자를 위해 공개하지 않아요.</p>\n'
if target not in text:
    raise SystemExit('target result note not found')
text = text.replace(target, '', 1)
path.write_text(text, encoding='utf-8')

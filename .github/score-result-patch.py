from pathlib import Path
import re

main_path = Path('src/main.jsx')
text = main_path.read_text(encoding='utf-8')

old_import = 'import { CAFES, KEYWORDS, TOTAL_CAFES, TOTAL_SECONDS } from "./offlineConfig";'
new_import = 'import { CAFES, KEYWORDS, TOTAL_CAFES, TOTAL_SECONDS, scoreKeywordAnswers } from "./offlineConfig";'
if old_import in text:
    text = text.replace(old_import, new_import, 1)
elif new_import not in text:
    raise SystemExit('offlineConfig import not found')

old_complete_call = '''      if (result?.status === "completed") {\n        onComplete();\n        return;\n      }'''
new_complete_call = '''      if (result?.status === "completed") {\n        onComplete(scoreKeywordAnswers(answers));\n        return;\n      }'''
if old_complete_call in text:
    text = text.replace(old_complete_call, new_complete_call, 1)
elif 'onComplete(scoreKeywordAnswers(answers));' not in text:
    raise SystemExit('completion callback not found')

complete_pattern = re.compile(r'function CompleteScreen\(\{ onRestart \}\) \{[\s\S]*?\n\}\n\nfunction App\(\) \{', re.M)
complete_replacement = '''function CompleteScreen({ result, onRestart }) {\n  const [seconds,setSeconds] = useState(8);\n  const safeResult = result || { correctCount: 0, totalCorrect: 9, accuracy: 0, byCafe: [] };\n\n  useEffect(()=>{\n    const tick=setInterval(()=>setSeconds(s=>Math.max(0,s-1)),1000);\n    const done=setTimeout(onRestart,8000);\n    return()=>{clearInterval(tick);clearTimeout(done)};\n  },[onRestart]);\n\n  return (\n    <main className="page-shell">\n      <GridBackground />\n      <AppHeader label="OFFLINE KEYWORD MATCH" />\n      <section className="complete-wrap result-complete-wrap">\n        <FallingBeans density="light" />\n        <div className="complete-card result-card">\n          <div className="check-circle"><Check size={38} strokeWidth={3}/></div>\n          <p className="kicker">완료</p>\n          <h1>키워드 매칭 결과</h1>\n          <p>총 9개의 정답 키워드 중 맞힌 개수예요.</p>\n\n          <div className="score-summary" aria-label={`정답 ${safeResult.correctCount}개, 정답률 ${safeResult.accuracy}%`}>\n            <div className="score-count-box">\n              <span className="score-label">맞힌 키워드</span>\n              <strong>{safeResult.correctCount}<small> / {safeResult.totalCorrect}개</small></strong>\n            </div>\n            <div className="score-rate-box">\n              <span className="score-label">정답률</span>\n              <strong>{safeResult.accuracy}<small>%</small></strong>\n            </div>\n          </div>\n\n          <div className="cafe-score-grid">\n            {(safeResult.byCafe || []).map((cafe) => (\n              <div className="cafe-score-item" key={cafe.cafeId}>\n                <span>카페 {cafe.cafeId}</span>\n                <strong>{cafe.correctCount} / {cafe.total}</strong>\n              </div>\n            ))}\n          </div>\n\n          <p className="result-note">정답 키워드는 다음 참여자를 위해 공개하지 않아요.</p>\n          <button className="btn btn-dark result-restart" onClick={onRestart}>처음 화면으로</button>\n          <div className="countdown">{seconds}초 후 처음 화면으로 돌아갑니다.</div>\n        </div>\n      </section>\n    </main>\n  );\n}\n\nfunction App() {'''
text, count = complete_pattern.subn(complete_replacement, text, count=1)
if count != 1 and 'function CompleteScreen({ result, onRestart })' not in text:
    raise SystemExit(f'CompleteScreen replacement failed: {count}')

old_state = '''  const [screen,setScreen] = useState("intro");\n  const [studentId,setStudentId] = useState("");'''
new_state = '''  const [screen,setScreen] = useState("intro");\n  const [studentId,setStudentId] = useState("");\n  const [resultSummary,setResultSummary] = useState(null);'''
if old_state in text:
    text = text.replace(old_state, new_state, 1)
elif 'const [resultSummary,setResultSummary]' not in text:
    raise SystemExit('App state block not found')

old_restart = '''  const restart = () => {\n    setStudentId("");\n    setScreen("intro");\n  };'''
new_restart = '''  const restart = () => {\n    setStudentId("");\n    setResultSummary(null);\n    setScreen("intro");\n  };'''
if old_restart in text:
    text = text.replace(old_restart, new_restart, 1)

old_routes = '''  if (screen==="game") return <KeywordGame studentId={studentId} onComplete={()=>setScreen("done")}/>;\n  return <CompleteScreen onRestart={restart}/>;'''
new_routes = '''  if (screen==="game") return <KeywordGame studentId={studentId} onComplete={(summary)=>{ setResultSummary(summary); setScreen("done"); }}/>;\n  return <CompleteScreen result={resultSummary} onRestart={restart}/>;'''
if old_routes in text:
    text = text.replace(old_routes, new_routes, 1)
elif 'result={resultSummary}' not in text:
    raise SystemExit('App routes not found')

main_path.write_text(text, encoding='utf-8')

css_path = Path('src/styles.css')
css = css_path.read_text(encoding='utf-8')
marker = '/* SCORE-RESULT-SCREEN */'
if marker not in css:
    css += '''\n\n/* SCORE-RESULT-SCREEN */\n/* 27개 키워드용: 5열로 유지하되 45개 버전보다 여유 있게 표시 */\n.keyword-grid{overflow-y:auto;align-content:start}\n.keyword-grid button{height:42px;font-size:13px}\n\n.result-complete-wrap{min-height:calc(100svh - 98px);height:auto;padding:24px 0 34px}\n.result-card{width:min(760px,92vw);padding:38px 48px 32px}\n.result-card .check-circle{width:74px;height:74px;margin-bottom:18px}\n.result-card h1{font-size:38px}\n.result-card>p:not(.kicker):not(.result-note){margin-top:10px}\n.score-summary{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:28px auto 16px;width:min(540px,100%)}\n.score-count-box,.score-rate-box{border:1px solid #e3e4e7;border-radius:18px;background:#fff;padding:20px 18px;text-align:left}\n.score-label{display:block;color:#85898e;font-size:12px;font-weight:800;margin-bottom:8px}\n.score-count-box strong,.score-rate-box strong{display:block;font-size:38px;line-height:1;color:#242526;letter-spacing:-.045em}\n.score-count-box small,.score-rate-box small{font-size:17px;font-weight:800;color:#777b80;letter-spacing:-.02em}\n.cafe-score-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;width:min(540px,100%);margin:0 auto}\n.cafe-score-item{border-radius:14px;background:#f5f5f6;padding:13px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px}\n.cafe-score-item span{font-size:12px;color:#73777c;font-weight:700}\n.cafe-score-item strong{font-size:15px;color:#242526}\n.result-note{margin:18px 0 0!important;color:#9a9da2!important;font-size:12px!important}\n.result-restart{width:min(360px,100%);margin:18px auto 0}\n.result-card .countdown{margin-top:12px;padding:12px}\n\n@media(max-width:700px){\n  .result-card{padding:30px 20px 24px}\n  .result-card h1{font-size:31px}\n  .score-summary{grid-template-columns:1fr 1fr;gap:8px}\n  .score-count-box,.score-rate-box{padding:16px 14px}\n  .score-count-box strong,.score-rate-box strong{font-size:31px}\n  .cafe-score-grid{grid-template-columns:1fr}\n}\n'''
css_path.write_text(css, encoding='utf-8')

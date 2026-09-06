
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft, ArrowRight, Check, ChevronLeft, Grid3X3,
  Heart, Home, MoreHorizontal, PlusSquare, RefreshCw, Search,
  UserRound
} from "lucide-react";
import "./styles.css";
import "./timer.css";
import { checkOfflineEligibility, completeOfflineKeywordMatch } from "./offlineStore";

const KEYWORDS = [
  "따뜻한","차분한","감성적인","전문적인","정갈한",
  "아늑한","트렌디한","친근한","미니멀한","고급스러운",
  "빈티지한","힙한","자연스러운","선명한","부드러운",
  "로컬한","세련된","편안한","개성있는","담백한",
  "신뢰감","장인정신","디저트","커피중심","공간중심",
  "이야기","계절감","색감","정성","취향"
];

const TOTAL_CAFES = 3;
const TOTAL_SECONDS = 60;
const FEED_FILES = Array.from({ length: 12 }, (_, i) => `/assets/ig-photo-${i + 1}.jpg`);
const CAFES = Array.from({ length: TOTAL_CAFES }, (_, cafe) => ({
  id: cafe + 1,
  posts: Array.from({ length: 6 }, (_, i) => FEED_FILES[(i + cafe * 2) % FEED_FILES.length]),
}));

function LiveClock() {
  const getTime = () => new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Seoul",
  }).format(new Date()).replace(/^24:/, "00:");
  const [time, setTime] = useState(getTime);
  useEffect(() => {
    const tick = () => setTime(getTime());
    const now = new Date();
    const wait = (60 - now.getSeconds()) * 1000 + 50;
    let timer;
    const first = setTimeout(() => { tick(); timer = setInterval(tick, 60000); }, wait);
    return () => { clearTimeout(first); if (timer) clearInterval(timer); };
  }, []);
  return <>{time}</>;
}

function GridBackground() {
  return <div className="grid-background" aria-hidden="true" />;
}

function FallingBeans({ density = "normal" }) {
  const beans = useMemo(() => {
    const arr = [
      [7,20,-24,.20,-1.2,7.8,-18],[19,24,18,.16,-5.2,9.6,28],[38,17,-14,.16,-2.8,8.2,-16],
      [53,22,31,.15,-7.4,10.4,40],[72,18,-28,.17,-.6,8.8,-24],[90,21,14,.16,-4.1,10.1,22]
    ];
    return density === "light" ? arr.slice(0,4) : arr;
  }, [density]);
  return (
    <div className="beans" aria-hidden="true">
      {beans.map(([left,size,rotate,opacity,delay,duration,drift], i) => (
        <span className="bean" key={i} style={{
          left:`${left}%`, width:size, height:size*1.55, opacity,
          "--r":`${rotate}deg`, "--delay":`${delay}s`, "--duration":`${duration}s`, "--drift":`${drift}px`,
        }}><span className="bean-crease"/></span>
      ))}
    </div>
  );
}

function AppHeader({ label, badge = "ONLINE → OFFLINE" }) {
  return (
    <header className="app-header">
      <div className="brand-lockup">
        <img src="/assets/cafe-moca-logo.png" alt="Cafe Moca" className="brand-logo" />
        <span className="header-label">{label}</span>
      </div>
      <div className="header-badge">{badge}</div>
    </header>
  );
}

function IntroScreen({ onSubmit }) {
  const [studentId,setStudentId] = useState("");
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    const id = studentId.trim();
    if (!/^\d{7,10}$/.test(id)) {
      setError("학번을 확인해주세요.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const result = await checkOfflineEligibility(id);
      if (result?.status === "eligible") {
        onSubmit(id, "game");
        return;
      }
      if (result?.status === "not_completed") {
        onSubmit(id, "qr");
        return;
      }
      if (result?.status === "already_participated") {
        setError("이미 오프라인 참여를 완료한 학번이에요.");
        return;
      }
      setError("참여 기록을 확인하지 못했어요. 다시 시도해주세요.");
    } catch (err) {
      console.error(err);
      setError("서버 연결을 확인해주세요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page-shell">
      <GridBackground />
      <AppHeader label="OFFLINE KEYWORD MATCH" />
      <section className="web-surface intro-surface">
        <FallingBeans density="light" />
        <div className="intro-copy">
          <p className="kicker">온라인 설문 다음 단계</p>
          <h1><span className="marker">피드만 보고</span><br/>골라주세요.</h1>
          <p className="body-copy">3개 카페 피드를 차례로 보여드릴게요. 총 60초 안에 골라주세요.</p>
        </div>
        <section className="entry-card">
          <p className="kicker">참여 확인</p>
          <h2>학번을 입력해주세요.</h2>
          <p className="helper">온라인 설문에 참여한 학번이면 바로 시작돼요.</p>
          <form onSubmit={submit}>
            <label>학번</label>
            <input value={studentId} onChange={e=>setStudentId(e.target.value)} inputMode="numeric" placeholder="2026XXXXXX" disabled={busy} />
            {error && <p className="error-text">{error}</p>}
            <button className="btn btn-dark" type="submit" disabled={busy}>{busy ? "확인 중..." : <>시작하기 <ArrowRight size={17}/></>}</button>
          </form>
          <p className="microcopy">참여 기록이 없으면 온라인 설문 QR이 나와요.</p>
        </section>
      </section>
    </main>
  );
}

function QRScreen({ onRetry }) {
  return (
    <main className="page-shell">
      <GridBackground />
      <AppHeader label="ONLINE SURVEY REQUIRED" />
      <section className="web-surface qr-surface">
        <div className="qr-left">
          <p className="kicker">온라인 설문부터 먼저 해주세요.</p>
          <h1><span className="marker">온라인 설문이</span><br/>아직 완료되지 않았어요.</h1>
          <p className="body-copy">QR로 설문을 끝낸 뒤 같은 학번으로 다시 들어오면 돼요.</p>
          <p className="flow-line">QR 스캔 <span>→</span> 설문 완료 <span>→</span> 다시 돌아오기</p>
        </div>
        <section className="qr-card">
          <p className="kicker">ONLINE SURVEY</p>
          <h2>여기서 먼저 참여해주세요.</h2>
          <div className="qr-box"><img src="/assets/mocasurvey-qr.png" alt="온라인 설문 QR" /></div>
          <p className="qr-url">mocasurvey.vercel.app</p>
          <button className="btn btn-outline" onClick={onRetry}><ArrowLeft size={16}/> 학번 다시 입력하기</button>
        </section>
      </section>
    </main>
  );
}

function IphoneInstagram({ cafeIndex }) {
  const cafe = CAFES[cafeIndex];
  return (
    <div className="phone-stage">
      <div className="phone-shell">
        <div className="phone-screen">
          <div className="dynamic-island" />
          <div className="status-bar">
            <span className="status-time"><LiveClock/></span>
            <div className="status-icons" aria-hidden="true">
              <img src="/assets/ios-mobile-signal.png" alt="" className="status-icon status-signal" />
              <img src="/assets/ios-wifi.png" alt="" className="status-icon status-wifi" />
              <img src="/assets/ios-battery.png" alt="" className="status-icon status-battery" />
            </div>
          </div>

          <div className="ig-header">
            <ChevronLeft size={24} strokeWidth={2}/>
            <strong>cafe.feed</strong>
            <div className="ig-actions"><Heart size={24} strokeWidth={2}/><MoreHorizontal size={22} strokeWidth={2}/></div>
          </div>

          <div className="ig-tabs">
            <Grid3X3 size={18} strokeWidth={1.9}/>
            <span className="reels-glyph">▣</span>
            <RefreshCw size={18} strokeWidth={1.9}/>
            <UserRound size={18} strokeWidth={1.9}/>
          </div>

          <div className="ig-grid">
            {cafe.posts.map((src, i) => <div className="ig-tile" key={i}><img src={src} alt="" /></div>)}
          </div>

          <div className="ig-spacer" />

          <div className="ig-bottom">
            <Home size={24} strokeWidth={2}/><Search size={24} strokeWidth={2}/><PlusSquare size={24} strokeWidth={2}/><Heart size={24} strokeWidth={2}/><span className="ig-avatar"/>
          </div>
          <div className="home-indicator" />
        </div>
      </div>
    </div>
  );
}

function KeywordGame({ studentId, onComplete }) {
  const [cafeIndex,setCafeIndex] = useState(0);
  const [answers,setAnswers] = useState(()=>Array.from({length:TOTAL_CAFES},()=>[]));
  const [secondsLeft,setSecondsLeft] = useState(TOTAL_SECONDS);
  const selected = answers[cafeIndex];
  const [saving,setSaving] = useState(false);
  const [saveError,setSaveError] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const timerPercent = (secondsLeft / TOTAL_SECONDS) * 100;
  const timerState = secondsLeft === 0 ? "expired" : secondsLeft <= 15 ? "urgent" : "";

  const toggle = (keyword) => {
    setSaveError("");
    setAnswers(prev => {
      const next = prev.map(v=>[...v]);
      const curr = next[cafeIndex];
      if (curr.includes(keyword)) next[cafeIndex] = curr.filter(k=>k!==keyword);
      else if (curr.length < 3) next[cafeIndex] = [...curr, keyword];
      return next;
    });
  };
  const reset = () => { setSaveError(""); setAnswers(prev=>prev.map((v,i)=>i===cafeIndex?[]:v)); };
  const next = async () => {
    if (selected.length !== 3) {
      setSaveError("키워드를 3개 선택해주세요.");
      return;
    }

    setSaveError("");

    if (cafeIndex < TOTAL_CAFES - 1) {
      setCafeIndex(v=>v+1);
      return;
    }

    setSaving(true);
    setSaveError("");
    try {
      const result = await completeOfflineKeywordMatch(studentId, answers);
      if (result?.status === "completed") {
        onComplete();
        return;
      }
      if (result?.status === "already_participated") {
        setSaveError("이미 참여 완료된 학번이에요.");
        return;
      }
      if (result?.status === "not_completed") {
        setSaveError("온라인 설문 완료 기록을 다시 확인해주세요.");
        return;
      }
      setSaveError("응답을 저장하지 못했어요. 다시 시도해주세요.");
    } catch (err) {
      console.error(err);
      setSaveError("저장 중 오류가 발생했어요. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page-shell game-page">
      <GridBackground />
      <AppHeader label="OFFLINE KEYWORD MATCH" badge={`총 ${TOTAL_CAFES}단계 · ${cafeIndex+1} / ${TOTAL_CAFES}`} />
      <section className={`game-timer ${timerState}`} aria-live="polite">
        <div className="game-timer-copy">
          <span>{secondsLeft === 0 ? "시간이 지났어요. 현재 선택을 마무리해주세요." : `총 ${TOTAL_CAFES}단계 · 60초 안에 완료해주세요.`}</span>
          <strong>{secondsLeft === 0 ? "시간 초과" : `${secondsLeft}초`}</strong>
        </div>
        <div className="game-timer-track" aria-hidden="true">
          <span className="game-timer-fill" style={{width:`${timerPercent}%`}} />
        </div>
      </section>
      <section className="game-layout">
        <IphoneInstagram cafeIndex={cafeIndex}/>
        <section className="keyword-panel">
          <div className="panel-top">
            <div>
              <h1>이 피드에서 어떤 느낌이 드나요?</h1>
              <p>떠오르는 키워드 3개를 골라주세요.</p>
            </div>
            <span className="selected-count">{selected.length} / 3</span>
          </div>
          <div className="panel-rule" />
          <div className="keyword-grid">
            {KEYWORDS.map(k=><button key={k} className={selected.includes(k)?"active":""} onClick={()=>toggle(k)}>{k}</button>)}
          </div>
          {saveError && <p className="save-error">{saveError}</p>}
          <div className="panel-actions">
            <button className="btn btn-outline" onClick={reset} disabled={saving}><RefreshCw size={16}/> 다시 고르기</button>
            <button className="btn btn-dark" onClick={next} disabled={saving || selected.length !== 3}>{saving ? "저장 중..." : <>{cafeIndex===TOTAL_CAFES-1?"완료":"다음 카페"} <ArrowRight size={16}/></>}</button>
          </div>
        </section>
      </section>
    </main>
  );
}

function CompleteScreen({ onRestart }) {
  const [seconds,setSeconds] = useState(3);
  useEffect(()=>{
    const tick=setInterval(()=>setSeconds(s=>Math.max(0,s-1)),1000);
    const done=setTimeout(onRestart,3000);
    return()=>{clearInterval(tick);clearTimeout(done)};
  },[onRestart]);
  return (
    <main className="page-shell">
      <GridBackground />
      <AppHeader label="OFFLINE KEYWORD MATCH" />
      <section className="complete-wrap">
        <FallingBeans density="light" />
        <div className="complete-card">
          <div className="check-circle"><Check size={38} strokeWidth={3}/></div>
          <p className="kicker">완료</p>
          <h1>키워드 선택 완료</h1>
          <p>응답이 저장됐어요.</p>
          <div className="countdown">{seconds}초 후 처음 화면으로 돌아갑니다.</div>
        </div>
      </section>
    </main>
  );
}

function App() {
  const [screen,setScreen] = useState("intro");
  const [studentId,setStudentId] = useState("");

  const handleEligibility = (id, nextScreen) => {
    setStudentId(id);
    setScreen(nextScreen);
  };

  const restart = () => {
    setStudentId("");
    setScreen("intro");
  };

  if (screen==="intro") return <IntroScreen onSubmit={handleEligibility}/>;
  if (screen==="qr") return <QRScreen onRetry={restart}/>;
  if (screen==="game") return <KeywordGame studentId={studentId} onComplete={()=>setScreen("done")}/>;
  return <CompleteScreen onRestart={restart}/>;
}

createRoot(document.getElementById("root")).render(<App/>);

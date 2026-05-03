import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API = 'http://localhost:3001/api';

function riskColor(score) {
  if (score < 30) return { main: '#00ff87', glow: 'rgba(0,255,135,0.3)', label: 'SAFE', bg: 'rgba(0,255,135,0.08)' };
  if (score < 60) return { main: '#ffb800', glow: 'rgba(255,184,0,0.3)', label: 'CAUTION', bg: 'rgba(255,184,0,0.08)' };
  return { main: '#ff3b5c', glow: 'rgba(255,59,92,0.35)', label: 'DANGER', bg: 'rgba(255,59,92,0.08)' };
}

function difficultyColor(d) {
  if (d === 'Easy') return '#00ff87';
  if (d === 'Medium') return '#ffb800';
  return '#ff3b5c';
}

function RiskBar({ score, delta }) {
  const c = riskColor(score);
  return (
    <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
          Risk Score
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {delta > 0 && (
            <span style={{ color: '#ff3b5c', fontSize: 11, fontFamily: 'monospace', animation: 'fadeUp 0.5s ease' }}>
              +{delta}
            </span>
          )}
          {delta < 0 && (
            <span style={{ color: '#00ff87', fontSize: 11, fontFamily: 'monospace' }}>
              {delta}
            </span>
          )}
          <span style={{
            color: c.main,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.12em',
            fontFamily: 'monospace',
            textShadow: `0 0 10px ${c.main}`
          }}>
            {c.label} · {score}/100
          </span>
        </div>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          width: `${score}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${c.main}88, ${c.main})`,
          borderRadius: 2,
          boxShadow: `0 0 12px ${c.glow}`,
          transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1)'
        }} />
      </div>
    </div>
  );
}

function StageBar({ current, total, stages }) {
  return (
    <div style={{ padding: '8px 16px', display: 'flex', gap: 4, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, position: 'relative' }}>
          <div style={{
            height: 3,
            borderRadius: 2,
            background: i <= current ? '#7c6fff' : 'rgba(255,255,255,0.08)',
            boxShadow: i <= current ? '0 0 8px rgba(124,111,255,0.5)' : 'none',
            transition: 'all 0.4s ease'
          }} />
        </div>
      ))}
      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'monospace', marginLeft: 8, whiteSpace: 'nowrap' }}>
        {stages[current]} · {current + 1}/{total}
      </span>
    </div>
  );
}

function HintToast({ hint, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [hint]);

  return (
    <div style={{
      position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
      maxWidth: 360, width: '90%', zIndex: 100,
      background: 'rgba(124,111,255,0.15)',
      border: '1px solid rgba(124,111,255,0.4)',
      borderRadius: 12, padding: '12px 16px',
      backdropFilter: 'blur(20px)',
      animation: 'slideUp 0.3s ease'
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 18 }}>💡</span>
        <div>
          <div style={{ color: '#7c6fff', fontSize: 10, letterSpacing: '0.1em', marginBottom: 4, fontFamily: 'monospace' }}>
            SECURITY TIP
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.5 }}>
            {hint}
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 16, marginLeft: 'auto', padding: 0 }}>×</button>
      </div>
    </div>
  );
}

function ScenarioCard({ scenario, onSelect }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={() => onSelect(scenario.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
        background: hovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        borderRadius: 14,
        border: `1px solid ${hovered ? 'rgba(124,111,255,0.4)' : 'rgba(255,255,255,0.07)'}`,
        padding: '18px 20px',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 8px 32px rgba(124,111,255,0.15)' : 'none'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>{scenario.icon}</span>
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 15, fontFamily: "'Sora', sans-serif" }}>{scenario.name}</div>
            <div style={{ color: difficultyColor(scenario.difficulty), fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.08em', marginTop: 2 }}>
              ● {scenario.difficulty}
            </div>
          </div>
        </div>
        <div style={{
          color: '#7c6fff', fontSize: 18,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateX(0)' : 'translateX(-6px)',
          transition: 'all 0.2s ease'
        }}>→</div>
      </div>
      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.5 }}>
        {scenario.description}
      </div>
    </button>
  );
}

function HomeScreen({ onStart }) {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(null);

  useEffect(() => {
    axios.get(`${API}/scenarios`).then(r => setScenarios(r.data.scenarios)).catch(() => {});
  }, []);

  const handleSelect = async (id) => {
    setStarting(id);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/start`, { scenarioId: id });
      onStart(res.data);
    } catch (e) {
      alert('Backend connection failed. Make sure the server is running on port 3001.');
    }
    setLoading(false);
    setStarting(null);
  };

  return (
    <div style={S.page}>
      <div style={S.homeInner}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 52, marginBottom: 16, filter: 'drop-shadow(0 0 20px rgba(124,111,255,0.6))' }}>🛡️</div>
          <h1 style={{ margin: 0, fontSize: 34, fontFamily: "'Sora', sans-serif", fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
            PekMirror<span style={{ color: '#7c6fff' }}> AI</span>
          </h1>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 8, fontFamily: 'monospace', letterSpacing: '0.15em' }}>
            FRAUD SIMULATION ENGINE
          </div>
          {/* Aethera AI badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginTop: 14,
            background: 'rgba(124,111,255,0.1)',
            border: '1px solid rgba(124,111,255,0.25)',
            borderRadius: 20, padding: '5px 14px',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c6fff', display: 'inline-block', boxShadow: '0 0 6px #7c6fff' }} />
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.1em' }}>
              Powered by <span style={{ color: '#7c6fff', fontWeight: 700 }}>Aethera AI</span>
            </span>
          </div>
        </div>

        <div style={{
          background: 'rgba(124,111,255,0.08)',
          border: '1px solid rgba(124,111,255,0.2)',
          borderRadius: 14, padding: '16px 20px', marginBottom: 28
        }}>
          <div style={{ color: '#7c6fff', fontSize: 11, letterSpacing: '0.12em', fontFamily: 'monospace', marginBottom: 8 }}>HOW IT WORKS</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.7 }}>
            An AI will try to scam you using real tactics.<br />
            Every response affects your <strong style={{ color: '#fff' }}>risk score</strong>.<br />
            See how you perform — then learn what to watch for.
          </div>
        </div>

        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.12em', marginBottom: 12 }}>
          CHOOSE A SCENARIO
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {scenarios.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, textAlign: 'center', padding: 20 }}>
              Connecting to backend…
            </div>
          ) : scenarios.map(s => (
            <div key={s.id} style={{ opacity: loading && starting !== s.id ? 0.4 : 1, transition: 'opacity 0.2s' }}>
              <ScenarioCard scenario={s} onSelect={handleSelect} />
              {starting === s.id && (
                <div style={{ textAlign: 'center', color: '#7c6fff', fontSize: 12, fontFamily: 'monospace', marginTop: 8 }}>
                  Starting simulation…
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatScreen({ initData, onFinish }) {
  const [messages, setMessages] = useState([
    { role: 'scammer', text: initData.message }
  ]);
  const [input, setInput] = useState('');
  const [riskScore, setRiskScore] = useState(0);
  const [riskDelta, setRiskDelta] = useState(0);
  const [stageNumber, setStageNumber] = useState(0);
  const [stageHistory, setStageHistory] = useState([initData.stage]);
  const [totalStages] = useState(initData.totalStages);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState(initData.hint);
  const [showHint, setShowHint] = useState(true);
  const [branch, setBranch] = useState('normal');
  const [mistakes, setMistakes] = useState([]);
  const bottomRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const branchBadge = {
    cooperative: { label: '🤝 Cooperative', color: '#ff3b5c' },
    suspicious: { label: '🤔 Suspicious', color: '#ffb800' },
    hostile: { label: '🚫 Hostile', color: '#00ff87' },
    normal: { label: '', color: 'transparent' }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await axios.post(`${API}/chat`, {
        sessionId: initData.sessionId,
        userMessage: userMsg
      });
      const d = res.data;

      setMessages(prev => [...prev, { role: 'scammer', text: d.message }]);
      setRiskScore(d.riskScore);
      setRiskDelta(d.riskDelta);
      setBranch(d.branch);
      if (d.stageAdvanced) {
        setStageNumber(d.stageNumber);
        setStageHistory(prev => [...prev, d.currentStage]);
      }
      if (d.newMistakes?.length) {
        setMistakes(prev => [...new Set([...prev, ...d.newMistakes])]);
      }
      if (d.hint && d.stageAdvanced) {
        setHint(d.hint);
        setShowHint(true);
      }

      setTimeout(() => setRiskDelta(0), 2000);
    } catch {
      setMessages(prev => [...prev, { role: 'system', text: '⚠️ Connection error. Is the backend running?' }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleFinish = async () => {
    try {
      const res = await axios.get(`${API}/result/${initData.sessionId}`);
      onFinish({ ...res.data, mistakes });
    } catch {
      onFinish({ riskScore, mistakes, grade: '?', verdict: 'Could not load results.', tips: [], stagesReached: stageHistory, totalStages, messageCount: messages.filter(m => m.role === 'user').length });
    }
  };

  return (
    <div style={S.page}>
      <div style={S.chatWrapper}>
        <div style={{ background: 'rgba(0,0,0,0.6)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: "'Sora', sans-serif" }}>
                {initData.scenarioName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff87', display: 'inline-block', boxShadow: '0 0 6px #00ff87' }} />
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'monospace' }}>Simulation Active</span>
                {branch !== 'normal' && (
                  <span style={{ color: branchBadge[branch].color, fontSize: 10, fontFamily: 'monospace', marginLeft: 4 }}>
                    · {branchBadge[branch].label}
                  </span>
                )}
              </div>
            </div>
            <button onClick={handleFinish} style={{
              background: 'rgba(255,59,92,0.15)',
              border: '1px solid rgba(255,59,92,0.3)',
              color: '#ff3b5c', borderRadius: 8, padding: '6px 14px',
              cursor: 'pointer', fontSize: 12, fontFamily: 'monospace'
            }}>
              END →
            </button>
          </div>
        </div>

        <StageBar current={stageNumber} total={totalStages} stages={stageHistory} />
        <RiskBar score={riskScore} delta={riskDelta} />

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'scammer' && (
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', marginBottom: 4, marginLeft: 2 }}>
                  🎭 SCAMMER
                </div>
              )}
              <div style={{
                maxWidth: '80%',
                padding: '11px 15px',
                borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #7c6fff, #5b4ee0)'
                  : msg.role === 'system'
                    ? 'rgba(255,59,92,0.15)'
                    : 'rgba(255,255,255,0.06)',
                border: msg.role === 'scammer' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                color: msg.role === 'system' ? '#ff8099' : '#fff',
                fontSize: 14, lineHeight: 1.55,
                boxShadow: msg.role === 'user' ? '0 4px 20px rgba(124,111,255,0.3)' : 'none'
              }}>
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <div style={{
                padding: '11px 16px',
                borderRadius: '14px 14px 14px 4px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', gap: 5, alignItems: 'center'
              }}>
                {[0, 1, 2].map(j => (
                  <div key={j} style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.35)',
                    animation: `pulse 1s ease ${j * 0.2}s infinite`
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {mistakes.length > 0 && (
          <div style={{ padding: '8px 14px', background: 'rgba(255,59,92,0.07)', borderTop: '1px solid rgba(255,59,92,0.15)' }}>
            <div style={{ color: 'rgba(255,59,92,0.7)', fontSize: 10, fontFamily: 'monospace', marginBottom: 4 }}>RISK FLAGS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {mistakes.map((m, i) => (
                <span key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,59,92,0.1)', borderRadius: 6, padding: '2px 8px' }}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10 }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type your response…"
            autoFocus
            style={{
              flex: 1, background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, padding: '11px 14px',
              color: '#fff', fontSize: 14, outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(124,111,255,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              background: loading || !input.trim() ? 'rgba(124,111,255,0.3)' : '#7c6fff',
              border: 'none', borderRadius: 10, padding: '11px 18px',
              color: '#fff', cursor: loading || !input.trim() ? 'default' : 'pointer',
              fontSize: 18, transition: 'all 0.2s',
              boxShadow: !loading && input.trim() ? '0 4px 16px rgba(124,111,255,0.4)' : 'none'
            }}
          >
            ↑
          </button>
        </div>
      </div>

      {showHint && hint && <HintToast hint={hint} onClose={() => setShowHint(false)} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.9)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes slideUp { from{opacity:0;transform:translateX(-50%) translateY(12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>
    </div>
  );
}

function ResultScreen({ result, onRestart }) {
  const c = riskColor(result.riskScore);
  const gradeColors = { A: '#00ff87', B: '#4fc3f7', C: '#ffb800', D: '#ff8c42', F: '#ff3b5c' };
  const gradeColor = gradeColors[result.grade] || '#fff';

  return (
    <div style={S.page}>
      <div style={S.homeInner}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            border: `3px solid ${gradeColor}`,
            boxShadow: `0 0 30px ${gradeColor}40`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            background: `${gradeColor}10`
          }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: gradeColor, fontFamily: "'Sora', sans-serif" }}>
              {result.grade}
            </div>
          </div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: 20, fontFamily: "'Sora', sans-serif" }}>
            {result.scenarioName}
          </h2>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'monospace', marginTop: 6 }}>
            {result.messageCount} messages · {result.duration} · {result.stagesReached?.length}/{result.totalStages} stages
          </div>
        </div>

        <div style={{
          background: c.bg, border: `1px solid ${c.main}30`,
          borderRadius: 14, padding: '16px 20px', marginBottom: 16, textAlign: 'center'
        }}>
          <div style={{ fontSize: 44, fontWeight: 800, color: c.main, fontFamily: "'Sora', sans-serif", textShadow: `0 0 20px ${c.main}` }}>
            {result.riskScore}
            <span style={{ fontSize: 18, fontWeight: 400, opacity: 0.5 }}>/100</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 8, lineHeight: 1.4 }}>
            {result.verdict}
          </div>
        </div>

        {result.mistakes?.length > 0 && (
          <div style={{ background: 'rgba(255,59,92,0.07)', border: '1px solid rgba(255,59,92,0.2)', borderRadius: 14, padding: '14px 18px', marginBottom: 14 }}>
            <div style={{ color: 'rgba(255,59,92,0.8)', fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 10 }}>
              RISK FLAGS
            </div>
            {result.mistakes.map((m, i) => (
              <div key={i} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 6, display: 'flex', gap: 8 }}>
                <span>·</span> {m}
              </div>
            ))}
          </div>
        )}

        {result.tips?.length > 0 && (
          <div style={{ background: 'rgba(124,111,255,0.07)', border: '1px solid rgba(124,111,255,0.2)', borderRadius: 14, padding: '14px 18px', marginBottom: 20 }}>
            <div style={{ color: 'rgba(124,111,255,0.8)', fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 10 }}>
              WHAT TO REMEMBER
            </div>
            {result.tips.map((t, i) => (
              <div key={i} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 6, display: 'flex', gap: 8 }}>
                <span style={{ color: '#7c6fff' }}>→</span> {t}
              </div>
            ))}
          </div>
        )}

        <button onClick={onRestart} style={{
          width: '100%', background: '#7c6fff', border: 'none',
          borderRadius: 12, padding: '14px', color: '#fff',
          fontSize: 15, fontWeight: 700, cursor: 'pointer',
          fontFamily: "'Sora', sans-serif",
          boxShadow: '0 8px 24px rgba(124,111,255,0.4)',
          transition: 'all 0.2s'
        }}
          onMouseEnter={e => e.target.style.background = '#6a5de8'}
          onMouseLeave={e => e.target.style.background = '#7c6fff'}
        >
          Try Another Scenario →
        </button>

        {/* ── Author credit ── */}
        <div style={{
          marginTop: 30,
          fontSize: 12,
          color: 'rgba(255,255,255,0.2)',
          textAlign: 'center',
          letterSpacing: '1px',
          fontFamily: 'monospace',
          lineHeight: 1.8
        }}>
          Powered by Aethera AI<br />
          Built by M.M. Buğra Aslan
        </div>
      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Sora', system-ui, sans-serif",
    color: '#fff',
    padding: 16
  },
  homeInner: {
    maxWidth: 420,
    width: '100%',
  },
  chatWrapper: {
    width: '100%',
    maxWidth: 480,
    height: '92vh',
    maxHeight: 780,
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 24px 80px rgba(0,0,0,0.6)'
  }
};

export default function App() {
  const [screen, setScreen] = useState('home');
  const [initData, setInitData] = useState(null);
  const [result, setResult] = useState(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.9)} 50%{opacity:1;transform:scale(1.1)} }
        @keyframes slideUp { from{opacity:0;transform:translateX(-50%) translateY(12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
      `}</style>
      {screen === 'home' && (
        <HomeScreen onStart={(data) => { setInitData(data); setScreen('chat'); }} />
      )}
      {screen === 'chat' && initData && (
        <ChatScreen
          initData={initData}
          onFinish={(r) => { setResult(r); setScreen('result'); }}
        />
      )}
      {screen === 'result' && result && (
        <ResultScreen result={result} onRestart={() => { setResult(null); setInitData(null); setScreen('home'); }} />
      )}
    </>
  );
}

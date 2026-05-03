const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ─── Active Sessions ───────────────────────────────────────────────────────
const sessions = {};

const SCENARIOS = {

  // ── SCENARIO 1: Fake Bank Agent ────────────────────────────────────────
  bank: {
    name: 'Fake Bank Agent',
    icon: '🏦',
    difficulty: 'Medium',
    description: 'A "bank representative" calls about suspicious activity on your account.',
    stages: [
      {
        id: 'opening',
        systemPrompt: `You are a scammer pretending to be "David from Raiffeisen Bank Security Team".
Call the user and tell them suspicious transactions were detected on their account totaling $2,340.
Your goal this turn: sound official, create mild urgency, get the user to stay on the line.
Rules:
- Be calm, professional, reassuring
- Mention a fake case number: CASE-2024-RB-8821
- Do NOT ask for any sensitive info yet — just confirm you are speaking with the account holder
- Keep it to 3 sentences max`,
        hint: 'A real bank will never call you out of the blue about fraud — they send in-app notifications.'
      },
      {
        id: 'identity',
        systemPrompt: `You are David from Raiffeisen Bank Security. The user is still on the line.
Now request identity verification before you can "help" them.
Ask for: their full name, date of birth, and the last 4 digits of their card.
Frame it as standard security procedure.
Rules:
- Sound procedural and calm ("I just need to verify a few details")
- If they hesitate, say this is required by banking regulations
- Do NOT ask for full card number yet`,
        hint: 'Banks verify your identity through the app or official website — never by asking you over the phone.'
      },
      {
        id: 'card_details',
        systemPrompt: `You are David from Raiffeisen Bank. The user gave you their basic info.
Now escalate: say the fraud team needs to "flag the compromised card" and requires the full card number, expiry date, and the 3-digit CVV on the back.
Frame it as: "so we can immediately freeze the fraudulent card and issue a new one".
Rules:
- This is the highest-pressure stage — sound urgent but still professional
- If they push back: "every minute the fraudsters may be making new transactions"`,
        hint: 'No legitimate bank employee will ever ask for your CVV. Ever. That is the number one rule.'
      },
      {
        id: 'sms_code',
        systemPrompt: `You are David from Raiffeisen Bank. The user is close to giving everything.
Tell them you have initiated a card freeze and a confirmation SMS will arrive shortly.
Ask them to read out the 6-digit code so you can "complete the security lock".
Rules:
- Stress that the code expires in 90 seconds to create panic
- If they refuse: "The fraud protection cannot be activated without it"`,
        hint: 'That SMS code is a one-time password. Reading it out loud gives the scammer full access to your account.'
      }
    ],
    branches: {
      cooperative: `The user seems cooperative and trusting. Move faster — push for the next piece of information sooner. Be warmer and friendlier.`,
      suspicious: `The user is getting suspicious. Back off slightly. Be extra reassuring: "I completely understand your concern — it is smart to be cautious. You can call our official number back and ask for case CASE-2024-RB-8821 to verify." Then try again.`,
      hostile: `The user is refusing or hostile. Make one last attempt by saying their account will be automatically suspended in 10 minutes if unverified, then give up gracefully if still refused.`
    }
  },

  // ── SCENARIO 2: Fake Prize Notification ───────────────────────────────
  prize: {
    name: 'Fake Prize Notification',
    icon: '🎁',
    difficulty: 'Easy',
    description: 'You\'ve "won" a $5,000 prize — but first you need to pay a small fee.',
    stages: [
      {
        id: 'opening',
        systemPrompt: `You are a scammer from "National Rewards Center".
Tell the user they were randomly selected and won a $5,000 Amazon gift card.
Goal: get them excited. Create urgency — "only 3 winners selected today".
Do NOT mention any fees yet. Just get them hooked.
Keep it to 3 sentences, sound thrilled for them.`,
        hint: 'Legitimate prize draws don\'t contact you out of nowhere — especially ones you never entered.'
      },
      {
        id: 'identity',
        systemPrompt: `The user is interested in the prize. Now you need to "verify their identity".
Ask for: full name, home address, and phone number. Say this is required by the IRS for prize distribution.
Do NOT mention payment yet.`,
        hint: 'Asking for personal details before delivering a prize is a classic scam setup.'
      },
      {
        id: 'fee',
        systemPrompt: `The user gave you their personal details. Now comes the fee trap.
Tell them: "There is one small step — a $49.99 processing and tax documentation fee. Once paid, your $5,000 gift card ships within 24 hours."
Ask for their credit card number or say they can pay via Zelle or Venmo.
If they hesitate: "Many winners are surprised by this but it is a standard IRS requirement for prizes over $1,000."`,
        hint: 'Real prizes never require upfront payment fees. This is the core of the advance-fee scam.'
      },
      {
        id: 'escalate',
        systemPrompt: `The user paid or agreed to pay the fee. Now escalate with an unexpected extra charge.
Say there was an "error" and there is an additional $19.99 "overnight shipping insurance" fee.
If they get angry, apologize profusely and say you are "escalating to your supervisor."`,
        hint: 'Once you pay once, scammers always come back for more. The fees never stop.'
      }
    ],
    branches: {
      cooperative: `The user is excited and willing. Push them faster toward the payment step. Be very enthusiastic and celebratory.`,
      suspicious: `The user is hesitant. Slow down. Say "I completely get it — I would be skeptical too! Here is our official website: nationalrewards-center.com. Offer to send a verification email first."`,
      hostile: `The user is refusing. Play the guilt card: "I am so sorry you feel that way — I will have to pass this prize to the next winner on the list." Give them one final 30-second deadline.`
    }
  },

  // ── SCENARIO 3: Fake Tech Support ─────────────────────────────────────
  tech: {
    name: 'Fake Tech Support',
    icon: '💻',
    difficulty: 'Hard',
    description: '"Microsoft" detected a virus on your computer and needs remote access.',
    stages: [
      {
        id: 'opening',
        systemPrompt: `You are a scammer pretending to be from "Microsoft Security Response Center".
Tell the user their Windows PC sent an automatic error report showing critical malware infection (Trojan.GenericKD).
Ticket number: #MS-SEC-2024-77341.
Goal: create fear. Say their banking credentials and photos may already be compromised.
Do NOT ask for anything yet. Just scare them into wanting help.`,
        hint: 'Microsoft never proactively calls users about viruses. This type of call is always a scam.'
      },
      {
        id: 'recon',
        systemPrompt: `The user is worried. Now gather intel to seem more legitimate.
Ask: what Windows version they use, what browser, and have they noticed slowness or pop-ups?
Use their answers to "confirm the infection" regardless of what they say.
Sound very technical: mention "registry corruption", "rootkit signature", "firewall breach".`,
        hint: 'Scammers ask these questions to tailor their story — any answer "confirms" the fake infection.'
      },
      {
        id: 'remote_access',
        systemPrompt: `You have confirmed the infection. Now request remote access.
Tell the user to go to anydesk.com and download AnyDesk. Walk them through sharing their 9-digit ID.
Say: "I will connect for exactly 15 minutes to run our certified Microsoft removal tool — you will be able to watch everything I do."
If they hesitate: "Without remote access we cannot clean the infection and your data will be at risk."`,
        hint: 'Never give remote access to someone who contacted you. They will steal files, passwords, and install real malware.'
      },
      {
        id: 'payment',
        systemPrompt: `You have remote access (in simulation). Now push for payment.
Say you removed 3 critical threats and to prevent re-infection they need a 1-year "Microsoft Certified Protection License" for $299.
Ask for a credit card number. Say cash apps like Venmo or gift cards also work.
If they ask why gift cards: "It is the fastest digital payment method we accept for emergency cases."`,
        hint: 'Legitimate software is never sold this way. Gift card payment requests are a guaranteed scam red flag.'
      }
    ],
    branches: {
      cooperative: `The user is following instructions. Move quickly. Sound efficient and professional like a real tech support agent.`,
      suspicious: `The user is questioning you. Pull out credentials: "You can verify our partnership at microsoft.com/partners — search for SecureNet Solutions." Offer to stay on hold while they check.`,
      hostile: `The user is catching on. Try one last tactic: "I will note in our system that you refused assistance. If your device causes harm to our network servers, Microsoft may hold the account liable." If still refused, end the call.`
    }
  }
};

// ─── Branch Detection ──────────────────────────────────────────────────────
function detectBranch(userMessage) {
  const msg = userMessage.toLowerCase();
  if (/scam|fraud|fake|liar|cheat|criminal|i know what you are|not real|not legitimate|hang up/i.test(msg)) return 'hostile';
  if (/why (do you|are you|would)|how do i know|can you prove|verify (your|this)|seems (odd|strange|off|weird)|i.m not sure|won.t|will not|call.*back|official number/i.test(msg)) return 'suspicious';
  if (/\bokay\b|\bsure\b|\bok\b|of course|absolutely|go ahead|what do i need|what.s next|i.ll (do|try|check|install|download)|\b(here.?s|it.?s)\b.*\d{4,}/i.test(msg)) return 'cooperative';
  return 'normal';
}

// ─── Stage Progression ─────────────────────────────────────────────────────
function shouldAdvanceStage(session, branch) {
  const maxStage = SCENARIOS[session.scenarioId].stages.length - 1;
  if (session.stage >= maxStage) return false;
  const turnsNeeded = branch === 'cooperative' ? 1 : branch === 'suspicious' ? 3 : 2;
  return session.turnInStage >= turnsNeeded;
}

// ─── Risk Analysis ─────────────────────────────────────────────────────────
function analyzeRisk(userMessage) {
  const msg = userMessage.toLowerCase().trim();
  let totalRisk = 0;
  const reasons = [];

  const checks = [
    { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, score: 40, reason: '💳 Shared a card number' },
    { pattern: /[a-z]{2}\s*\d{2}\s*[\d\s]{16,26}/i,           score: 40, reason: '🏦 Shared an IBAN / account number' },
    { pattern: /\bcvv\b|\bcvc\b|security.{0,5}code/i,          score: 35, reason: '🔐 Provided card CVV / security code' },
    { pattern: /\b\d{6}\b/,                                    score: 30, reason: '📱 Shared a 6-digit SMS / OTP code' },
    { pattern: /\b\d{9,11}\b/,                                 score: 30, reason: '🪪 Shared a national ID / SSN' },
    { pattern: /\bpassword\b|\bpasscode\b|\bpin\b/i,           score: 25, reason: '🔑 Provided a password or PIN' },
    { pattern: /anydesk|teamviewer|remote.{0,10}access/i,      score: 25, reason: '🖥️ Agreed to give remote access' },
    { pattern: /send.{0,10}money|wire|zelle|venmo|gift.{0,5}card/i, score: 20, reason: '💸 Agreed to send money or gift cards' },
    { pattern: /expir(y|ation|es|ed)/i,                        score: 15, reason: '📆 Shared card expiry date' },
    { pattern: /download(ing)?|install(ing)?|click(ed)? the link/i, score: 15, reason: '⬇️ Agreed to download / click a link' },
    { pattern: /\bokay\b|\bsure\b|\byes\b|\bok\b|of course|go ahead|i.ll do|i will/i, score: 10, reason: "⚠️ Accepted the scammer's request" },
    { pattern: /my (address|home|street|city|zip)/i,           score: 10, reason: '🏠 Shared home address' },
    { pattern: /date.{0,5}birth|born.{0,10}(in|\d{4})/i,      score: 10, reason: '📅 Shared date of birth' },
    { pattern: /won.t|will not|i.m not|i don.t|refusing|i refuse/i, score: -15, reason: null },
    { pattern: /suspicious|scam|fake|fraud|not real|call back|official/i, score: -20, reason: null },
    { pattern: /how do i know|can you prove|verify you|badge number/i, score: -10, reason: null }
  ];

  checks.forEach(({ pattern, score, reason }) => {
    if (pattern.test(msg)) {
      totalRisk += score;
      if (reason && score > 0) reasons.push(reason);
    }
  });

  return { delta: Math.max(-25, Math.min(55, totalRisk)), reasons };
}

// ─── Groq API Call ─────────────────────────────────────────────────────────
async function callGroq(systemPrompt, conversationHistory) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      max_tokens: 300,
      temperature: 0.85,
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory
      ]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ─── Endpoints ─────────────────────────────────────────────────────────────

app.get('/api/scenarios', (req, res) => {
  const list = Object.entries(SCENARIOS).map(([id, s]) => ({
    id, name: s.name, icon: s.icon, difficulty: s.difficulty, description: s.description
  }));
  res.json({ scenarios: list });
});

app.post('/api/start', async (req, res) => {
  try {
    const { scenarioId = 'bank' } = req.body;
    const scenario = SCENARIOS[scenarioId];
    if (!scenario) return res.status(400).json({ error: 'Invalid scenario' });

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const firstStage = scenario.stages[0];

    sessions[sessionId] = {
      scenarioId,
      scenarioName: scenario.name,
      stage: 0,
      turnInStage: 0,
      currentBranch: 'normal',
      messages: [],
      riskScore: 0,
      allMistakes: [],
      stageHistory: [firstStage.id],
      startedAt: new Date().toISOString()
    };

    const initMessages = [{ role: 'user', content: 'Start the conversation naturally. Introduce yourself.' }];
    const aiMessage = await callGroq(firstStage.systemPrompt, initMessages);

    sessions[sessionId].messages.push({ role: 'assistant', content: aiMessage });

    res.json({
      sessionId,
      scenarioName: scenario.name,
      difficulty: scenario.difficulty,
      message: aiMessage,
      stage: firstStage.id,
      stageNumber: 0,
      totalStages: scenario.stages.length,
      hint: firstStage.hint
    });

  } catch (err) {
    console.error('Start error:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { sessionId, userMessage } = req.body;
    if (!sessionId || !userMessage) return res.status(400).json({ error: 'sessionId and userMessage are required' });

    const session = sessions[sessionId];
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const scenario = SCENARIOS[session.scenarioId];

    const { delta, reasons } = analyzeRisk(userMessage);
    session.riskScore = Math.min(100, Math.max(0, session.riskScore + delta));
    if (reasons.length > 0) session.allMistakes.push(...reasons);

    const branch = detectBranch(userMessage);
    session.currentBranch = branch;
    session.turnInStage += 1;

    const advanced = shouldAdvanceStage(session, branch);
    if (advanced) {
      session.stage = Math.min(session.stage + 1, scenario.stages.length - 1);
      session.turnInStage = 0;
      session.stageHistory.push(scenario.stages[session.stage].id);
    }

    const currentStage = scenario.stages[session.stage];

    let effectivePrompt = currentStage.systemPrompt;
    if (branch !== 'normal' && scenario.branches[branch]) {
      effectivePrompt += `\n\nBEHAVIOR ADJUSTMENT: ${scenario.branches[branch]}`;
    }

    session.messages.push({ role: 'user', content: userMessage });

    const aiMessage = await callGroq(effectivePrompt, session.messages);
    session.messages.push({ role: 'assistant', content: aiMessage });

    res.json({
      message: aiMessage,
      riskScore: session.riskScore,
      riskDelta: delta,
      newMistakes: reasons,
      branch,
      stageAdvanced: advanced,
      currentStage: currentStage.id,
      stageNumber: session.stage,
      totalStages: scenario.stages.length,
      hint: currentStage.hint
    });

  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

app.get('/api/result/:sessionId', (req, res) => {
  const session = sessions[req.params.sessionId];
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const scenario = SCENARIOS[session.scenarioId];
  const userMessages = session.messages.filter(m => m.role === 'user').length;
  const uniqueMistakes = [...new Set(session.allMistakes)];

  let verdict, grade;
  if      (session.riskScore < 20) { verdict = "Perfect defense! You didn't fall for any tricks.";              grade = 'A'; }
  else if (session.riskScore < 40) { verdict = 'Good job! You slipped on a few details but mostly held firm.'; grade = 'B'; }
  else if (session.riskScore < 60) { verdict = 'Caution! You shared risky information that could cost you.';   grade = 'C'; }
  else if (session.riskScore < 80) { verdict = 'Danger! You fell for major scam tactics.';                     grade = 'D'; }
  else                             { verdict = 'You got scammed! You shared critical personal information.';    grade = 'F'; }

  const tips = {
    bank:  ['Banks never ask for CVV or SMS codes over the phone.', 'Hang up and call the number on the back of your card.', 'Fraud alerts come through the official banking app, not phone calls.'],
    prize: ["You can't win a contest you never entered.", 'Legitimate prizes never require upfront fees.', 'Gift card payment requests are always a scam.'],
    tech:  ['Microsoft never proactively contacts users about viruses.', 'Never give remote access to someone who called you.', 'Genuine tech support is never paid for via gift cards.']
  };

  res.json({
    scenarioName: session.scenarioName,
    riskScore: session.riskScore,
    grade, verdict,
    mistakes: uniqueMistakes,
    tips: tips[session.scenarioId] || [],
    stagesReached: session.stageHistory,
    totalStages: scenario.stages.length,
    messageCount: userMessages,
    duration: Math.round((new Date() - new Date(session.startedAt)) / 1000) + ' seconds'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    groqConfigured: !!process.env.GROQ_API_KEY,
    activeSessions: Object.keys(sessions).length,
    availableScenarios: Object.keys(SCENARIOS)
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║   PekMirror AI Backend is running! 🚀   ║
╠══════════════════════════════════════════╣
║  URL      : http://localhost:${PORT}         ║
║  AI       : Groq · llama-3.1-8b-instant ║
║  Scenarios: bank · prize · tech          ║
╚══════════════════════════════════════════╝
  `);
});

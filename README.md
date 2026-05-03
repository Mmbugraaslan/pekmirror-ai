# PekMirror AI – Fraud Simulation Engine 🛡️

## Quick Start

### 1. Get Gemini API Key (Free)
Go to: https://aistudio.google.com/app/apikey  
Click "Create API Key" → Copy it.

---

### 2. Backend Setup

```bash
cd backend
npm init -y
npm install express cors dotenv @google/generative-ai

cp .env.example .env
# Open .env and paste your Gemini API key:
# GEMINI_API_KEY=your-key-here

node index.js
```

Backend runs at: http://localhost:3001

---

### 3. Frontend Setup

```bash
cd frontend
npx create-react-app .
npm install axios

# Replace src/App.js with src/App.jsx (already provided)
npm start
```

Frontend runs at: http://localhost:3000

---

## Project Structure

```
pekmirror-ai/
├── backend/
│   ├── index.js        ← Express API + Gemini + Scenarios
│   ├── .env.example    ← Copy to .env, add API key
│   └── .env            ← (you create this)
└── frontend/
    └── src/
        └── App.jsx     ← Full React UI
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/scenarios | List all scenarios |
| POST | /api/start | Start a session |
| POST | /api/chat | Send a message |
| GET | /api/result/:id | Get results |
| GET | /api/health | Health check |

## Scenarios

- 🏦 **Fake Bank Agent** (Medium) — Raiffeisen Bank fraud call
- 🎁 **Fake Prize Notification** (Easy) — You won $5,000!
- 💻 **Fake Tech Support** (Hard) — Microsoft virus alert

## Risk Score Logic

| Score | Grade | Verdict |
|-------|-------|---------|
| 0–19 | A | Perfect defense |
| 20–39 | B | Mostly held firm |
| 40–59 | C | Risky info shared |
| 60–79 | D | Fell for major tactics |
| 80–100 | F | Got scammed |

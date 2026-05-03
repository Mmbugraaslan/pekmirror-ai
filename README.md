# 🛡️ PekMirror AI — Fraud Simulation Engine

> **Can you resist an AI scammer?**  
> PekMirror AI puts you face-to-face with real social engineering tactics and scores your responses in real time.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Stack](https://img.shields.io/badge/stack-React%20%7C%20Node.js%20%7C%20Groq-purple)
![Powered by](https://img.shields.io/badge/powered%20by-Aethera%20AI-7c6fff)

---

## 🎯 What is PekMirror AI?

PekMirror AI is an interactive fraud awareness platform where an AI plays the role of a scammer and tries to manipulate you using real-world tactics. Every message you send affects your **live risk score**. At the end of each session, you receive a grade, a breakdown of your mistakes, and personalized security tips.

The goal is simple: **learn by experience before a real scammer finds you.**

---

## 🚀 Features

- 🎭 **3 Scam Scenarios** — Fake Bank Agent, Fake Prize Notification, Fake Tech Support
- 📊 **Live Risk Score** — Every response is analyzed and scored in real time
- 🔀 **Branching Dialogue System** — The AI adapts based on how you respond (cooperative / suspicious / hostile)
- 💡 **Security Tips** — Contextual hints and post-session advice
- 🏆 **Graded Results** — A to F grade with detailed risk flag breakdown
- 🌙 **Dark UI** — Clean, modern interface built with React

---

## 🛠️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React, Axios                      |
| Backend   | Node.js, Express                  |
| AI        | Groq API (llama-3.1-8b-instant)   |
| Powered by| Aethera AI                        |

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- A free [Groq API key](https://console.groq.com)

---

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/pekmirror-ai.git
cd pekmirror-ai
```

### 2. Set up the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and add your Groq API key:

```
GROQ_API_KEY=your_groq_api_key_here
```

Start the backend:

```bash
node index.js
```

Backend runs on **http://localhost:3001**

---

### 3. Set up the Frontend

```bash
cd frontend
npx create-react-app .
npm install axios
```

Replace `src/App.js` with the provided `src/App.jsx`, then:

```bash
npm start
```

Frontend runs on **http://localhost:3000**

---

## 📁 Project Structure

```
pekmirror-ai/
├── backend/
│   ├── index.js          # Express server + Groq AI + scenario engine
│   └── .env.example      # Environment variable template
├── frontend/
│   └── src/
│       └── App.jsx       # Full React UI
├── LICENSE
└── README.md
```

---

## 🎮 Scenarios

| Scenario | Difficulty | Description |
|----------|-----------|-------------|
| 🏦 Fake Bank Agent | Medium | A "bank representative" calls about suspicious activity on your account |
| 🎁 Fake Prize Notification | Easy | You've "won" a $5,000 prize — but first you need to pay a small fee |
| 💻 Fake Tech Support | Hard | "Microsoft" detected a virus and needs remote access to your computer |

---

## 🔒 Security Note

This project is built for **educational purposes only**. All scam scenarios simulate real-world tactics to help users recognize and resist social engineering attacks.

Your `.env` file containing your API key is **never** committed to the repository.

---

## 📄 License

MIT © 2025 [M.M. Buğra Aslan](https://github.com/yourusername)

---

<div align="center">
  Powered by <strong>Aethera AI</strong> &nbsp;·&nbsp; Built by <strong>M.M. Buğra Aslan</strong>
</div>

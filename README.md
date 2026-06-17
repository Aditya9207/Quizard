<div align="center">

# 🧙 Quizard

### An AI-Powered Quiz Application

**Play classic trivia or generate personalized quizzes instantly from your own documents using Google Gemini AI.**

![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![TensorFlow](https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)

</div>

---

## 📖 Table of Contents

- [About The Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Project Implementation](#project-live-implementation) 

---

## About The Project

Quizard is a full-stack AI quiz application built to go beyond static trivia. It combines a classic trivia experience with a document-to-quiz pipeline powered by Google Gemini, enabling users to upload any PDF or paste any text and receive an instant, structured quiz based on that content.

On top of that, a TensorFlow.js model runs entirely in the browser to power adaptive difficulty — adjusting question difficulty in real-time based on how the user is performing, without any server-side inference.

The project was built as a capstone personal project to explore practical applications of client-side ML, generative AI integration, and modern React architecture.

**[→ Try it live](https://quizard-two.vercel.app)**
---

## Features

### 🎯 Classic Quiz Mode
Play trivia across **50+ categories** sourced from the Open Trivia Database. Fully customizable — set the number of questions, difficulty level, and countdown timer before you start.

### 📄 Document-to-Quiz (AI Powered)
Upload a **PDF or paste raw text**, and Quizard uses **Google Gemini 1.5 Flash** to automatically generate a structured, relevant quiz from that content. Useful for studying notes, research papers, or any document you want to test yourself on.

### 🤖 Smart AI Recommendations
Before starting a quiz, Quizard's ML model suggests the most suitable difficulty level for the selected category, based on your historical performance data stored in Firestore.

### 📈 Adaptive Difficulty
During a quiz, **TensorFlow.js** processes your real-time performance and dynamically adjusts question difficulty — harder questions if you're on a streak, easier ones if you're struggling.

### 🔐 Authentication & Leaderboards
Secure sign-in via **Firebase Authentication**. User stats, past quiz performance, and scores are tracked in **Firestore** and surfaced on a global leaderboard.

### 🎨 Modern UI/UX
Fully responsive glassmorphic design with smooth micro-interactions and page transitions powered by **Framer Motion**. Performance charts and result breakdowns rendered with **Recharts**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Charts | Recharts |
| Auth & Database | Firebase (Auth + Firestore) |
| Hosting | Firebase Hosting |
| AI — Quiz Generation | Google Gemini 1.5 Flash API |
| AI — Trivia Questions | Open Trivia Database API |
| ML — Adaptive Difficulty | TensorFlow.js (client-side) |

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or above recommended)
- A **Firebase** project ([console.firebase.google.com](https://console.firebase.google.com))
- A **Google Gemini API key** ([aistudio.google.com](https://aistudio.google.com))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/quizard.git

# 2. Navigate into the project directory
cd quizard

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Environment Variables

Create a `.env.local` file in the root of the project and add the following keys.

```env
# Firebase Configuration
# Get these from: Firebase Console → Project Settings → Your Apps
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# Google Gemini API
# Get this from: https://aistudio.google.com/app/apikey
VITE_GEMINI_API_KEY=your_gemini_api_key
```



---

## How It Works

### Document-to-Quiz Pipeline

1. User uploads a PDF or pastes raw text into the UI.
2. The text is extracted client-side and sent to the **Gemini 1.5 Flash API** with a structured prompt.
3. Gemini returns a JSON array of questions, options, and correct answers.
4. Quizard parses the response and renders it as a playable quiz instantly.

### Adaptive Difficulty (TensorFlow.js)

1. A lightweight model is loaded in the browser via TensorFlow.js.
2. On each answered question, the model receives a feature vector (current streak, accuracy, time taken, difficulty level).
3. The model outputs a difficulty adjustment signal — the next question is fetched at the adjusted difficulty from the Open Trivia DB API.
4. All inference happens **client-side** — no backend, no latency from model calls.

---

## Project Structure

```
quizard/
├── public/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route-level page components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # Firebase, Gemini API, OpenTDB API calls
│   ├── ml/               # TensorFlow.js model logic
│   ├── utils/            # Helper functions
│   └── main.jsx
├── .env.local            # Environment variables (not committed)
├── .gitignore
├── index.html
├── vite.config.js
└── package.json
```
## Project Live Implementation 
<img width="1920" height="1001" alt="screencapture-quizard-two-vercel-app-2026-06-18-00_01_08" src="https://github.com/user-attachments/assets/209e946a-dde2-48a0-b1e6-bf5adfa89539" />

<img width="1920" height="1052" alt="screencapture-quizard-two-vercel-app-2026-06-18-00_01_50" src="https://github.com/user-attachments/assets/e17f525f-7481-4c9c-988b-dc3b2ef5f6fe" />

<img width="1920" height="1052" alt="screencapture-quizard-two-vercel-app-2026-06-18-00_02_55" src="https://github.com/user-attachments/assets/69d03287-35c7-4b24-870e-b91d030ff251" />

<img width="1920" height="1203" alt="screencapture-quizard-two-vercel-app-2026-06-18-00_03_58" src="https://github.com/user-attachments/assets/91c99cf5-7c60-4349-bf94-5a72ac21be25" />

<img width="1920" height="998" alt="screencapture-quizard-two-vercel-app-2026-06-18-00_05_58" src="https://github.com/user-attachments/assets/d1198daf-dd4e-4a91-a515-3d798b79990f" />

<img width="1920" height="1466" alt="screencapture-quizard-two-vercel-app-dashboard-2026-06-18-00_06_36" src="https://github.com/user-attachments/assets/86a3b15b-2b39-4781-b84a-97346f9c9b28" />

---

<div align="center">
  Built by <a href="https://github.com/your-username">Aditya</a>
</div>

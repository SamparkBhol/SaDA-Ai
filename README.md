# 🎉 SaDA AI - Smart Document Analysis & Customer Support Automation

## 🚀 Project Overview

SaDA AI is an end-to-end AI-powered system for intelligent document analysis and multimodal customer support automation. It combines advanced LLM integrations with a modern, animated React frontend and robust backend using FastAPI. The system provides real-time chat, smart analysis of documents, and intuitive user experiences.

---
### Screenshots
![image](https://github.com/user-attachments/assets/d2ecda65-38a4-4fff-9109-2f2aa67af482)
![image](https://github.com/user-attachments/assets/f6877bdc-11c2-4874-a678-2e353fdf27ac)
![image](https://github.com/user-attachments/assets/4c094cd0-89f6-4807-bbdc-0974c56ca00d)
![image](https://github.com/user-attachments/assets/d37054ad-e2a3-407c-9330-4f3c6a383fee)

---
## ✅ Core Features

### 📂 Intelligent Document Analysis
- Supports PDF, TXT, CSV, DOCX
- Provides summary, key insights, sentiment analysis, entity recognition
- Session-based persistent analysis
- Gemini API integration via emergentintegrations

### 💬 Multimodal Customer Support
- Supports text, image, audio, and video inputs
- Real-time AI chat with persistent sessions
- Context-aware assistant using Gemini LLM
- Drag-and-drop media uploads

### 🎨 Modern UI/UX
- Fully responsive design (desktop + mobile)
- Animations via GSAP and Framer Motion
- Tailwind CSS with glassmorphism and gradient styles
- Interactive feature cards and smooth transitions

---

## 🏗️ Technical Architecture

### Backend – FastAPI + MongoDB
- 11+ RESTful API endpoints
- File processing with base64 handling
- Environment-based config via `.env`
- Models for sessions, documents, messages
- Robust validation and error handling
- CORS setup for frontend integration

### Frontend – React + Tailwind + GSAP
- Modular React components
- State managed via hooks
- File uploads via React Dropzone
- Animations using GSAP & Framer Motion
- Built with Craco and custom Tailwind config

### AI Integration – Gemini API
- Multimodal input support (text/image/audio/video)
- LLM-based contextual chat and analysis
- API Key: `AIzaSyB_Mdb2IqoDFc3Eiuqn7is7Hoe7fQFQdIo`
- Persistent conversation memory

---

## 🧪 Testing & Validation

- ✅ 100% backend test coverage (11/11 tests passed)
- File parsing and base64 conversion validated
- LLM output tested for all analysis types
- MongoDB CRUD operations verified
- API responses verified against real inputs

---

## 📱 Key User Flows

### Document Analysis
1. Start or resume session
2. Select analysis type
3. Upload document (drag and drop)
4. View AI-generated output
5. Access past session data

### Customer Support
1. Start or resume support chat
2. Send message or upload file
3. Receive smart AI reply
4. Maintain conversation over multiple turns
5. View full message history

---

## 🔧 Installation & Setup

### Backend 

cd backend
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn python-dotenv requests pydantic aiofiles


### Frontend

cd frontend
npm install --global yarn
yarn install
yarn start

#### If you want to try get it locally and try it 😄 , you have to replace links of DB + env api keys

##### -------- And then --------

> **Status:** ✅ Ok! all ready to go .....

🎓 Smart Campus

콘텐츠 중심 UX 기반 스마트 대학 플랫폼 (React + TypeScript)

🚀 Overview

Smart Campus는 기존 대학 시스템의 복잡한 UX를 개선하기 위해
👉 쇼핑몰 UX 기반으로 재설계한 콘텐츠 중심 대학 플랫폼입니다.

강의, 교재, 추천 콘텐츠를 하나의 흐름으로 연결하여
👉 사용자가 직관적으로 탐색하고 수강신청까지 이어지도록 설계했습니다.

✨ Key Features
🔐 Authentication
로그인 / 로그아웃
localStorage 기반 세션 유지
📚 Course Browsing
강의 리스트 및 상세 페이지
카드 UI 기반 탐색
🛒 Cart System (수강신청)
과목 담기 / 삭제
중복 방지 로직
실시간 수량 표시
📖 Book System
강의별 교재 연결
교재 상세 페이지
카테고리 기반 추천
🤖 Chatbot (MVP)
규칙 기반 학사 질의응답
교재 추천 / 강의 정보 안내
🧭 User Flow
Login
 ↓
Browse Courses
 ↓
Course Detail
 ↓
View Books
 ↓
Recommendations
 ↓
Add to Cart
 ↓
Chatbot Interaction
🏗️ Tech Stack
Category	Stack
Frontend	React + TypeScript
Routing	React Router
State	localStorage
Styling	CSS
Data	Static JSON
📁 Project Structure
src/
├─ components/      # Reusable UI components
├─ pages/           # Page components
├─ data/            # Course / Book data
├─ App.tsx
🧠 Core Logic
1. Session Management
function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

👉 Persist login state across refresh

2. Cart Duplicate Prevention
if (list.some(item => item.courseId === course.courseId)) {
  return { ok: false };
}

👉 Prevent duplicate course selection

3. Course → Book Mapping
const related = books.filter(
  b => b.courseId === course.courseId
);

👉 Content relationship design

4. Recommendation System
books.filter(b => b.category === current.category)

👉 Category-based filtering

5. Chatbot Logic
function chatbotReply(message) {
  if (message.includes("추천")) {
    return "추천 도서...";
  }
}

👉 Rule-based chatbot (MVP)

📸 Screenshots
🏠 Home




📚 Courses




🛒 Cart




🤖 Chatbot




🎥 Demo (Recommended)
Login Flow
Add to Cart
Chatbot Interaction

👉 Add GIFs in /images

🧪 Demo Accounts
Role	Email	Password
Student	student@test.com	student123
Professor	prof@test.com	prof123
⚠️ Limitations (MVP)
No backend (static data)
Limited security (localStorage)
No personalization
🚀 Future Improvements
Backend
REST API
Database integration
JWT authentication
Features
Search / Filter
Timetable system
Payment integration
AI
GPT-based chatbot
Personalized recommendation
💡 Design Philosophy
Content-first UX
Simple but scalable architecture
User behavior-driven design
🔗 Repository

👉 https://github.com/yourname/smart-campus

🏁 Summary

👉
React 기반으로 콘텐츠 흐름 중심 UX를 설계하고, 인증·장바구니·챗봇 기능을 구현한 스마트 대학 플랫폼 MVP

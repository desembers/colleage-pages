# 스마트 대학 홈페이지 (React + TypeScript)

정적 HTML/CSS/JS 버전을 React + TypeScript 기반 SPA로 재구성한 MVP입니다.

## 구현 기능

- 로그인/로그아웃 (데모 계정, `localStorage` 세션)
- 수강신청 페이지 (과목 목록, 장바구니 담기, 중복 방지)
- 장바구니 페이지 (과목 삭제, 개수 반영)
- 강의 상세 → 교재 목록 연결
- 교재 상세 → 같은 카테고리 추천
- 백엔드 없는 규칙 기반 챗봇

## 데모 계정

- 학생: `student@test.com` / `student123`
- 교수: `prof@test.com` / `prof123`

## 실행 방법

1. 의존성 설치
   - `npm install`
2. 개발 서버 실행
   - `npm run dev`
3. 빌드 확인
   - `npm run build`

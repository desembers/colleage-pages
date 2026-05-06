import { type FormEvent, type ReactElement, useEffect, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';

type UserRole = 'student' | 'professor';
type SessionUser = { name: string; email: string; role: UserRole };
type Course = { courseId: string; courseName: string; professor: string; category: string; credits: number; summary: string; popular: boolean };
type Book = { bookId: string; title: string; author: string; category: string; courseId: string; summary: string; price: number };
type CartCourse = Omit<Course, 'summary' | 'popular'> & { addedAt: number };
type ChatLine = { role: 'user' | 'bot'; text: string };

const demoUsers: Array<SessionUser & { password: string }> = [
  { name: '김학생', email: 'student@test.com', password: 'student123', role: 'student' },
  { name: '이교수', email: 'prof@test.com', password: 'prof123', role: 'professor' },
];
const courses: Course[] = [
  { courseId: 'CS101', courseName: '데이터 분석 입문', professor: '홍길동', category: '전공', credits: 3, summary: '파이썬 기반 데이터 전처리와 시각화 기초를 학습합니다.', popular: true },
  { courseId: 'CS201', courseName: '웹 프로그래밍', professor: '이웹', category: '전공', credits: 3, summary: 'React, API, 클라이언트 상태관리를 실습 중심으로 다룹니다.', popular: true },
  { courseId: 'MA101', courseName: '미적분학 I', professor: '박수학', category: '교양', credits: 3, summary: '극한, 미분, 적분의 핵심 개념과 응용 문제를 학습합니다.', popular: true },
  { courseId: 'EN102', courseName: '영어 회화', professor: 'Jane Kim', category: '교양', credits: 2, summary: '발표 및 토론 중심의 실전 회화 능력을 향상합니다.', popular: false },
];
const books: Book[] = [
  { bookId: 'B001', title: '데이터 분석 기초', author: '김데이터', category: '데이터 분석', courseId: 'CS101', summary: '데이터 분석 입문자를 위한 기본 개념과 예제 수록', price: 28000 },
  { bookId: 'B002', title: '파이썬 데이터 분석', author: '이파이', category: '데이터 분석', courseId: 'CS101', summary: 'pandas와 numpy 중심 실습', price: 32000 },
  { bookId: 'B003', title: '모던 자바스크립트 입문', author: '박자바', category: '웹 개발', courseId: 'CS201', summary: '최신 자바스크립트 문법과 브라우저 동작 원리', price: 26000 },
  { bookId: 'B004', title: 'HTTP 완벽 가이드', author: '정네트', category: '웹 개발', courseId: 'CS201', summary: 'RESTful 설계와 HTTP 프로토콜 원리', price: 35000 },
  { bookId: 'B005', title: '미적분 교과서', author: '박수학', category: '수학', courseId: 'MA101', summary: '핵심 이론과 단계별 문제 풀이', price: 22000 },
];

const SESSION_KEY = 'smart_univ_session';
const CART_KEY = 'smart_univ_cart';

function getSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}
function setSession(user: SessionUser) { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); }
function clearSession() { localStorage.removeItem(SESSION_KEY); }
function getCart(): CartCourse[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartCourse[]) : [];
  } catch {
    return [];
  }
}
function setCart(list: CartCourse[]) { localStorage.setItem(CART_KEY, JSON.stringify(list)); }
function notifyCartUpdated() { window.dispatchEvent(new Event('cart-updated')); }
function addCourseToCart(course: Course): { ok: boolean; error?: string } {
  const list = getCart();
  if (list.some((item) => item.courseId === course.courseId)) return { ok: false, error: '이미 장바구니에 담긴 과목입니다.' };
  list.push({ courseId: course.courseId, courseName: course.courseName, professor: course.professor, category: course.category, credits: course.credits, addedAt: Date.now() });
  setCart(list);
  notifyCartUpdated();
  return { ok: true };
}
function removeCourseFromCart(courseId: string) {
  setCart(getCart().filter((c) => c.courseId !== courseId));
  notifyCartUpdated();
}

function chatbotReply(message: string): string {
  const q = message.trim().toLowerCase();
  if (!q) return '질문을 입력해 주세요. 예: CS101 교재 뭐야?';
  if (/로그인|비밀번호|비번/.test(q)) return '데모 계정: 학생 student@test.com / student123, 교수 prof@test.com / prof123';
  if (/추천/.test(q) && /데이터|분석/.test(q)) return `데이터 분석 추천 도서: ${books.filter((b) => b.category === '데이터 분석').map((b) => b.title).join(', ')}`;

  const idMatch = q.match(/\b(cs|ma|en)\d{3}\b/i);
  if (idMatch && /교재|책/.test(q)) {
    const cid = idMatch[0].toUpperCase();
    const course = courses.find((c) => c.courseId === cid);
    if (!course) return `과목 코드 ${cid}를 찾을 수 없습니다.`;
    const related = books.filter((b) => b.courseId === cid);
    return related.length ? `${course.courseName}(${cid}) 교재: ${related.map((b) => `${b.title}(${b.author})`).join(', ')}` : `${cid} 과목의 교재 정보가 없습니다.`;
  }
  return '예시 질문: "CS101 교재 뭐야?", "데이터 분석 책 추천해줘"';
}

function RequireAuth({ children }: { children: ReactElement }) {
  return getSession() ? children : <Navigate to='/login' replace />;
}

function Layout({ children }: { children: ReactElement }) {
  const [cartCount, setCartCount] = useState(getCart().length);
  const user = getSession();
  const nav = useNavigate();

  useEffect(() => {
    const refresh = () => setCartCount(getCart().length);
    window.addEventListener('cart-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('cart-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return (
    <div className='page'>
      <header className='topbar'>
        <Link to='/' className='brand'>스마트 캠퍼스</Link>
        <nav className='menu'>
          <Link to='/courses'>수강신청</Link>
          <Link to='/cart'>장바구니 ({cartCount})</Link>
          {user ? (
            <button type='button' onClick={() => { clearSession(); nav('/'); }}>
              {user.name} 로그아웃
            </button>
          ) : <Link to='/login'>로그인</Link>}
        </nav>
      </header>
      {children}
      <ChatWidget />
    </div>
  );
}

function HomePage() {
  return (
    <main className='container'>
      <section className='hero'>
        <p className='eyebrow'>React + TypeScript MVP</p>
        <h1>수강과 교재를 한 번에 처리하는 스마트 대학 홈페이지</h1>
        <p>복잡한 학사 시스템을 장바구니 UX로 단순화하고, 교재와 추천 도서를 자연스럽게 연결합니다.</p>
        <div className='row'>
          <Link className='btn primary' to='/courses'>수강신청 시작</Link>
          <Link className='btn' to='/login'>로그인</Link>
        </div>
      </section>
      <section className='panel'>
        <h2>서비스 설명</h2>
        <ul>
          <li>학생: 과목 조회, 장바구니 담기/삭제, 강의별 교재 확인</li>
          <li>교수/교직원(데모): 로그인 후 동일 UI 탐색 가능</li>
          <li>추천 로직: 현재 교재와 같은 카테고리 기준 필터링</li>
          <li>챗봇: 백엔드 없이 규칙 기반 학사 질의응답</li>
        </ul>
      </section>
    </main>
  );
}

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const user = demoUsers.find((u) => u.email === email.trim().toLowerCase() && u.password === password);
    if (!user) return setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    setSession({ name: user.name, email: user.email, role: user.role });
    nav('/');
  };

  return (
    <main className='container narrow'>
      <h1>로그인</h1>
      <form className='panel' onSubmit={submit}>
        <label>이메일<input value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>비밀번호<input type='password' value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <p className='error'>{error}</p>}
        <button className='btn primary' type='submit'>로그인</button>
      </form>
      <p className='hint'>데모 계정: student@test.com / student123, prof@test.com / prof123</p>
    </main>
  );
}

function CoursesPage() {
  const [, setRefresh] = useState(0);
  return (
    <main className='container'>
      <h1>수강신청</h1>
      <div className='grid'>
        {courses.map((course) => {
          const inCart = getCart().some((c) => c.courseId === course.courseId);
          return (
            <article key={course.courseId} className='card'>
              <Link to={`/course/${course.courseId}`}><strong>{course.courseName}</strong></Link>
              <span>{course.courseId} · {course.professor} · {course.credits}학점</span>
              <p>{course.summary}</p>
              <button
                type='button'
                disabled={inCart}
                className='btn primary'
                onClick={() => {
                  if (!getSession()) return alert('로그인이 필요합니다.');
                  const result = addCourseToCart(course);
                  if (!result.ok) alert(result.error);
                  setRefresh((v) => v + 1);
                }}
              >
                {inCart ? '담김' : '담기'}
              </button>
            </article>
          );
        })}
      </div>
    </main>
  );
}

function CartPage() {
  const [tick, setTick] = useState(0);
  const list = getCart();

  return (
    <main className='container'>
      <h1>장바구니 ({list.length})</h1>
      <div className='grid' key={tick}>
        {list.length === 0 && <p>담긴 과목이 없습니다.</p>}
        {list.map((item) => (
          <article key={item.courseId} className='card'>
            <Link to={`/course/${item.courseId}`}><strong>{item.courseName}</strong></Link>
            <span>{item.courseId} · {item.professor}</span>
            <button
              className='btn'
              type='button'
              onClick={() => {
                removeCourseFromCart(item.courseId);
                setTick((v) => v + 1);
              }}
            >
              삭제
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}

function CourseDetailPage() {
  const { courseId } = useParams();
  const course = courses.find((c) => c.courseId === courseId);
  if (!course) return <main className='container'><p>과목을 찾을 수 없습니다.</p></main>;

  const related = books.filter((b) => b.courseId === course.courseId);
  return (
    <main className='container'>
      <h1>{course.courseName}</h1>
      <p>{course.courseId} · {course.professor} · {course.credits}학점</p>
      <p>{course.summary}</p>
      <h2>교재 목록</h2>
      <div className='grid'>
        {related.map((book) => (
          <Link key={book.bookId} className='card' to={`/book/${book.bookId}`}>
            <strong>{book.title}</strong>
            <span>{book.author} · {book.category}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}

function BookDetailPage() {
  const { bookId } = useParams();
  const book = books.find((b) => b.bookId === bookId);
  if (!book) return <main className='container'><p>교재를 찾을 수 없습니다.</p></main>;

  const related = books.filter((b) => b.category === book.category && b.bookId !== book.bookId);
  return (
    <main className='container'>
      <h1>{book.title}</h1>
      <p>{book.author} · {book.category} · {book.price.toLocaleString()}원</p>
      <p>{book.summary}</p>
      <h2>추천 도서</h2>
      <div className='grid'>
        {related.length === 0 && <p>같은 카테고리 추천 도서가 없습니다.</p>}
        {related.map((item) => (
          <Link key={item.bookId} className='card' to={`/book/${item.bookId}`}>
            <strong>{item.title}</strong>
            <span>{item.author}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [lines, setLines] = useState<ChatLine[]>([{ role: 'bot', text: '안녕하세요! 예: CS101 교재 뭐야?' }]);

  return (
    <div className='chat-root'>
      {open && (
        <section className='chat-panel'>
          <div className='chat-head'>
            <strong>학사 챗봇</strong>
            <button type='button' onClick={() => setOpen(false)}>닫기</button>
          </div>
          <div className='chat-body'>
            {lines.map((line, idx) => <p key={`${line.role}-${idx}`} className={line.role === 'user' ? 'me' : 'bot'}>{line.text}</p>)}
          </div>
          <form
            className='chat-form'
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim()) return;
              const question = text;
              setText('');
              setLines((prev) => [...prev, { role: 'user', text: question }, { role: 'bot', text: chatbotReply(question) }]);
            }}
          >
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder='질문 입력...' />
            <button className='btn primary' type='submit'>전송</button>
          </form>
        </section>
      )}
      <button className='chat-toggle' type='button' onClick={() => setOpen((v) => !v)}>{open ? '닫기' : '챗봇'}</button>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path='/' element={<Layout><HomePage /></Layout>} />
      <Route path='/login' element={<Layout><LoginPage /></Layout>} />
      <Route path='/courses' element={<Layout><CoursesPage /></Layout>} />
      <Route path='/cart' element={<Layout><RequireAuth><CartPage /></RequireAuth></Layout>} />
      <Route path='/course/:courseId' element={<Layout><CourseDetailPage /></Layout>} />
      <Route path='/book/:bookId' element={<Layout><BookDetailPage /></Layout>} />
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

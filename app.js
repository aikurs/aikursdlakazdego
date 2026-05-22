// ============================================
// NAFFY.AI — app.js
// Firebase config + utilities + kurs data
// ============================================

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCDSP_ztZ88ftNZwrG_xA5X-9NWmG-rHGA",
  authDomain: "ai-kurs-w-biznesie.firebaseapp.com",
  projectId: "ai-kurs-w-biznesie",
  storageBucket: "ai-kurs-w-biznesie.firebasestorage.app",
  messagingSenderId: "978692477925",
  appId: "1:978692477925:web:264bdd5a60d12e1415d50c",
  measurementId: "G-PKT77Y8SMD"
};

// ---- TOAST ----
function showToast(msg, type = 'success') {
  let t = document.getElementById('toast')
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t) }
  t.className = 'toast toast-' + type
  t.innerHTML = (type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ') + ' ' + msg
  t.classList.add('show')
  clearTimeout(t._timer)
  t._timer = setTimeout(() => t.classList.remove('show'), 3200)
}

// ---- LOCAL STORAGE ----
const KV = {
  get(k) { try { return JSON.parse(localStorage.getItem('naffy_' + k)) } catch (e) { return null } },
  set(k, v) { localStorage.setItem('naffy_' + k, JSON.stringify(v)) },
  del(k) { localStorage.removeItem('naffy_' + k) }
}

// ---- USER DISPLAY NAME ----
function getUserDisplayName(user) {
  if (!user) return 'Użytkownik'
  return (user.displayName) || user.email.split('@')[0]
}

// ---- DEFAULT KURS DATA (fallback) ----
function getKursData() {
  return KV.get('kurs_data') || {
    modules: [
      {
        id: 1, title: "Podstawy AI", lessons: [
          { id: "1-1", title: "Czym jest AI i dlaczego to nie science fiction", time: "12 min", ytId: "", pdfs: [], homework: "", desc: "W tej lekcji dowiesz się czym naprawdę jest sztuczna inteligencja.", quiz: [] },
          { id: "1-2", title: "Jak działa ChatGPT, Claude i inne modele językowe", time: "15 min", ytId: "", pdfs: [], homework: "", desc: "Poznasz mechanizm działania dużych modeli językowych.", quiz: [] },
          { id: "1-3", title: "Przegląd narzędzi AI — co i kiedy używać", time: "10 min", ytId: "", pdfs: [], homework: "", desc: "Kompletny przegląd narzędzi AI dostępnych w 2025 roku.", quiz: [] },
          { id: "1-4", title: "Pierwsze kroki z ChatGPT — ćwiczenie", time: "20 min", ytId: "", pdfs: [], homework: "Załóż konto na chat.openai.com i napisz swój pierwszy prompt.", desc: "Praktyczne ćwiczenie z ChatGPT.", quiz: [] },
        ]
      },
      {
        id: 2, title: "Prompting", lessons: [
          { id: "2-1", title: "Anatomia dobrego promptu", time: "14 min", ytId: "", pdfs: [], homework: "", desc: "Poznasz cztery elementy każdego skutecznego promptu.", quiz: [] },
          { id: "2-2", title: "Techniki: Zero-shot, Few-shot, Chain of Thought", time: "18 min", ytId: "", pdfs: [], homework: "", desc: "Trzy zaawansowane techniki promptingu.", quiz: [] },
          { id: "2-3", title: "Prompty dla biznesu — maile, oferty, raporty", time: "20 min", ytId: "", pdfs: [], homework: "Napisz 5 promptów dla swojej firmy.", desc: "Gotowe schematy promptów do zadań biznesowych.", quiz: [] },
          { id: "2-4", title: "Ćwiczenie: 10 promptów dla Twojej branży", time: "30 min", ytId: "", pdfs: [], homework: "Stwórz bibliotekę 10 promptów.", desc: "Tworzysz własną bibliotekę promptów.", quiz: [] },
        ]
      },
      {
        id: 3, title: "AI w sprzedaży", lessons: [
          { id: "3-1", title: "Bot na live sprzedażowy", time: "20 min", ytId: "", pdfs: [], homework: "", desc: "Jak zbudować bota który wychwytuje zamówienia.", quiz: [] },
          { id: "3-2", title: "Budowa chatbota do obsługi klienta", time: "25 min", ytId: "", pdfs: [], homework: "Zbuduj chatbota w Tidio.", desc: "Krok po kroku budujesz chatbota.", quiz: [] },
          { id: "3-3", title: "Automatyczne odpowiedzi na maile", time: "18 min", ytId: "", pdfs: [], homework: "", desc: "System automatycznych odpowiedzi.", quiz: [] },
        ]
      },
      {
        id: 4, title: "AI w marketingu", lessons: [
          { id: "4-1", title: "Generowanie grafik — Midjourney, DALL-E", time: "20 min", ytId: "", pdfs: [], homework: "Wygeneruj 3 grafiki dla swojej firmy.", desc: "Tworzysz grafiki w 30 sekund.", quiz: [] },
          { id: "4-2", title: "Tworzenie postów social media z AI", time: "18 min", ytId: "", pdfs: [], homework: "", desc: "Miesiąc postów w jednej sesji.", quiz: [] },
          { id: "4-3", title: "Copywriting AI — opisy, oferty, landing page", time: "15 min", ytId: "", pdfs: [], homework: "", desc: "Schematy promptów do copywritingu.", quiz: [] },
          { id: "4-4", title: "Automatyczne podsumowanie live'ów", time: "12 min", ytId: "", pdfs: [], homework: "", desc: "System generowania contentu po live.", quiz: [] },
        ]
      },
      {
        id: 5, title: "Automatyzacja", lessons: [
          { id: "5-1", title: "Audyt firmy AI — gdzie tracisz pieniądze", time: "20 min", ytId: "", pdfs: [], homework: "Wypełnij szablon audytu.", desc: "Kompletny audyt Twojej firmy.", quiz: [] },
          { id: "5-2", title: "Automatyzacja raportów i analizy danych", time: "22 min", ytId: "", pdfs: [], homework: "", desc: "ChatGPT do analizy danych.", quiz: [] },
          { id: "5-3", title: "AI w zarządzaniu energią i surowcami", time: "18 min", ytId: "", pdfs: [], homework: "", desc: "Systemy AI redukujące zużycie energii.", quiz: [] },
          { id: "5-4", title: "Ćwiczenie: 90-dniowy plan wdrożenia AI", time: "45 min", ytId: "", pdfs: [], homework: "Stwórz 90-dniowy plan AI.", desc: "Konkretny plan wdrożenia AI.", quiz: [] },
        ]
      },
      {
        id: 6, title: "Strategia AI", lessons: [
          { id: "6-1", title: "Trendy AI na najbliższe 3 lata", time: "15 min", ytId: "", pdfs: [], homework: "", desc: "Technologie AI które zdominują rynek.", quiz: [] },
          { id: "6-2", title: "AI a prawo, prywatność i bezpieczeństwo", time: "20 min", ytId: "", pdfs: [], homework: "", desc: "Prawne aspekty używania AI.", quiz: [] },
          { id: "6-3", title: "Jak budować kulturę AI w zespole", time: "15 min", ytId: "", pdfs: [], homework: "", desc: "Wdrożenie AI bez oporu pracowników.", quiz: [] },
          { id: "6-4", title: "Egzamin końcowy i certyfikat", time: "30 min", ytId: "", pdfs: [], homework: "Zdaj egzamin z wynikiem min. 75%.", desc: "Końcowy egzamin i certyfikat.", quiz: [] },
        ]
      },
    ]
  }
}

// ---- ACHIEVEMENTS CONFIG ----
const ACHIEVEMENTS = [
  { id: 'first_lesson', icon: '🌱', title: 'Pierwszy krok', desc: 'Ukończyłeś swoją pierwszą lekcję!', condition: (done, total, streak) => done >= 1 },
  { id: 'first_module', icon: '📦', title: 'Moduł 1 zaliczony', desc: 'Ukończyłeś cały pierwszy moduł!', condition: (done, total, streak, mods) => mods >= 1 },
  { id: 'halfway', icon: '💪', title: 'Półmetek', desc: 'Jesteś w połowie kursu!', condition: (done, total) => total > 0 && done >= Math.floor(total / 2) },
  { id: 'streak_3', icon: '🔥', title: '3 dni z rzędu', desc: 'Uczysz się 3 dni z rzędu!', condition: (done, total, streak) => streak >= 3 },
  { id: 'streak_7', icon: '⚡', title: 'Tygodniowy streak', desc: '7 dni nauki z rzędu!', condition: (done, total, streak) => streak >= 7 },
  { id: 'notes_writer', icon: '✏️', title: 'Skrupulatny', desc: 'Zapisałeś notatki do 5 lekcji!', condition: (done, total, streak, mods, notesCount) => notesCount >= 5 },
  { id: 'all_done', icon: '🏆', title: 'Mistrz AI', desc: 'Ukończyłeś cały kurs!', condition: (done, total) => total > 0 && done >= total },
]

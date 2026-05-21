/* ============================================
   NAFFY.AI — SHARED UTILITIES (Firebase Auth)
   ============================================ */

// ---- FIREBASE CONFIG ----
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCDSP_ztZ88ftNZwrG_xA5X-9NWmG-rHGA",
  authDomain: "ai-kurs-w-biznesie.firebaseapp.com",
  projectId: "ai-kurs-w-biznesie",
  storageBucket: "ai-kurs-w-biznesie.firebasestorage.app",
  messagingSenderId: "978692477925",
  appId: "1:978692477925:web:264bdd5a60d12e1415d50c",
  measurementId: "G-PKT77Y8SMD"
}

// ---- TOAST ----
function showToast(msg, type='success'){
  let t = document.getElementById('toast')
  if(!t){ t=document.createElement('div'); t.id='toast'; document.body.appendChild(t) }
  t.className = 'toast-'+type
  t.innerHTML = (type==='success'?'✓':type==='error'?'✕':'ℹ') + ' ' + msg
  t.classList.add('show')
  clearTimeout(t._timer)
  t._timer = setTimeout(()=>t.classList.remove('show'), 3000)
}

// ---- ALERTS ----
function showAlert(id, msg, type='error'){
  const el = document.getElementById(id)
  if(!el) return
  el.textContent = msg
  el.className = 'alert alert-'+type+' show'
}
function hideAlert(id){
  const el = document.getElementById(id)
  if(el) el.className = 'alert'
}

// ---- MODAL ----
function openModal(id){ document.getElementById(id).classList.add('open') }
function closeModal(id){ document.getElementById(id).classList.remove('open') }
window.addEventListener('click', e=>{
  document.querySelectorAll('.modal-overlay.open').forEach(m=>{
    if(e.target===m) m.classList.remove('open')
  })
})

// ---- LOCAL STORAGE ----
const KV = {
  get(k){ try{ return JSON.parse(localStorage.getItem('naffy_'+k)) }catch(e){ return null } },
  set(k,v){ localStorage.setItem('naffy_'+k, JSON.stringify(v)) },
  del(k){ localStorage.removeItem('naffy_'+k) }
}

// ---- KURS DATA ----
const DEFAULT_KURS = {
  modules: [
    {
      id: 1, title: "Podstawy AI", lessons: [
        { id:"1-1", title:"Czym jest AI i dlaczego to nie science fiction", time:"12 min", ytId:"", pdfs:[], homework:"", desc:"W tej lekcji dowiesz się czym naprawdę jest sztuczna inteligencja." },
        { id:"1-2", title:"Jak działa ChatGPT, Claude i inne modele językowe", time:"15 min", ytId:"", pdfs:[], homework:"", desc:"Poznasz mechanizm działania dużych modeli językowych." },
        { id:"1-3", title:"Przegląd narzędzi AI — co i kiedy używać", time:"10 min", ytId:"", pdfs:[], homework:"", desc:"Kompletny przegląd narzędzi AI dostępnych w 2025 roku." },
        { id:"1-4", title:"Pierwsze kroki z ChatGPT — ćwiczenie", time:"20 min", ytId:"", pdfs:[], homework:"Załóż konto na chat.openai.com i napisz swój pierwszy prompt.", desc:"Praktyczne ćwiczenie — zakładasz konto i piszesz pierwsze prompty." },
      ]
    },
    {
      id: 2, title: "Prompting", lessons: [
        { id:"2-1", title:"Anatomia dobrego promptu — struktura która działa", time:"14 min", ytId:"", pdfs:[], homework:"", desc:"Poznasz cztery elementy każdego skutecznego promptu." },
        { id:"2-2", title:"Techniki: Zero-shot, Few-shot, Chain of Thought", time:"18 min", ytId:"", pdfs:[], homework:"", desc:"Trzy zaawansowane techniki promptingu." },
        { id:"2-3", title:"Prompty dla biznesu — maile, oferty, raporty", time:"20 min", ytId:"", pdfs:[], homework:"Napisz 5 promptów dla swojej firmy korzystając z biblioteki.", desc:"Gotowe schematy promptów do najczęstszych zadań biznesowych." },
        { id:"2-4", title:"Ćwiczenie: 10 promptów dla Twojej branży", time:"30 min", ytId:"", pdfs:[], homework:"Stwórz własną bibliotekę 10 promptów i prześlij jako PDF.", desc:"Stworzysz własną bibliotekę 10 promptów." },
      ]
    },
    {
      id: 3, title: "AI w sprzedaży", lessons: [
        { id:"3-1", title:"Bot na live sprzedażowy — wychwytuje zamówienia", time:"20 min", ytId:"", pdfs:[], homework:"", desc:"Dowiesz się jak zbudować bota który wychwytuje zamówienia." },
        { id:"3-2", title:"Budowa chatbota do obsługi klienta krok po krok", time:"25 min", ytId:"", pdfs:[], homework:"Zbuduj chatbota w Tidio i pokaż screenshot.", desc:"Krok po kroku zbudujesz chatbota w Tidio." },
        { id:"3-3", title:"Automatyczne odpowiedzi na maile", time:"18 min", ytId:"", pdfs:[], homework:"", desc:"Skonfigurujesz system automatycznych odpowiedzi na e-maile." },
      ]
    },
    {
      id: 4, title: "AI w marketingu", lessons: [
        { id:"4-1", title:"Generowanie grafik — Midjourney, DALL-E, Firefly", time:"20 min", ytId:"", pdfs:[], homework:"Wygeneruj 3 grafiki dla swojej firmy i prześlij.", desc:"Nauczysz się tworzyć profesjonalne grafiki w 30 sekund." },
        { id:"4-2", title:"Tworzenie postów social media z AI", time:"18 min", ytId:"", pdfs:[], homework:"", desc:"Stworzysz miesiąc postów na wszystkie platformy w jednej sesji." },
        { id:"4-3", title:"Copywriting AI — opisy, oferty, landing page", time:"15 min", ytId:"", pdfs:[], homework:"", desc:"Poznasz sprawdzone schematy promptów do copywritingu." },
        { id:"4-4", title:"Automatyczne podsumowanie live'ów i content", time:"12 min", ytId:"", pdfs:[], homework:"", desc:"Skonfigurujesz system który po każdym live generuje content." },
      ]
    },
    {
      id: 5, title: "Automatyzacja", lessons: [
        { id:"5-1", title:"Audyt firmy AI — gdzie tracisz pieniądze", time:"20 min", ytId:"", pdfs:[], homework:"Wypełnij szablon audytu dla swojej firmy.", desc:"Przeprowadzisz kompletny audyt swojej firmy." },
        { id:"5-2", title:"Automatyzacja raportów i analizy danych", time:"22 min", ytId:"", pdfs:[], homework:"", desc:"Nauczysz się używać ChatGPT do analizy danych." },
        { id:"5-3", title:"AI w zarządzaniu energią i surowcami", time:"18 min", ytId:"", pdfs:[], homework:"", desc:"Poznasz systemy AI które redukują zużycie energii." },
        { id:"5-4", title:"Ćwiczenie: 90-dniowy plan wdrożenia AI", time:"45 min", ytId:"", pdfs:[], homework:"Stwórz 90-dniowy plan wdrożenia AI w swojej firmie.", desc:"Stworzysz konkretny plan wdrożenia AI na 90 dni." },
      ]
    },
    {
      id: 6, title: "Strategia AI", lessons: [
        { id:"6-1", title:"Trendy AI na najbliższe 3 lata", time:"15 min", ytId:"", pdfs:[], homework:"", desc:"Dowiesz się jakie technologie AI zdominują rynek w 3 lata." },
        { id:"6-2", title:"AI a prawo, prywatność i bezpieczeństwo", time:"20 min", ytId:"", pdfs:[], homework:"", desc:"Poznasz prawne aspekty używania AI w firmie." },
        { id:"6-3", title:"Jak budować kulturę AI w zespole", time:"15 min", ytId:"", pdfs:[], homework:"", desc:"Nauczysz się jak wdrożyć AI w zespole bez oporu pracowników." },
        { id:"6-4", title:"Egzamin końcowy i certyfikat", time:"30 min", ytId:"", pdfs:[], homework:"Zdaj egzamin z wynikiem min. 75% żeby otrzymać certyfikat.", desc:"Końcowy egzamin z całego kursu i certyfikat ukończenia." },
      ]
    },
  ]
}

function getKursData(){
  return KV.get('kurs_data') || DEFAULT_KURS
}

// ---- FIREBASE AUTH HELPERS ----
// Poprawiono: adres e-mail ujęty w cudzysłów
const ADMIN_EMAILS = ["psp45rostyslav@gmail.com"] 

function isAdmin(user){
  if(!user) return false
  return ADMIN_EMAILS.includes(user.email)
}

function getUserDisplayName(user){
  if(!user) return ''
  return user.displayName || user.email.split('@')[0]
}

function logout(){
  if(typeof firebase !== 'undefined'){
    // Poprawiono: 'index.html' zamiart '/index.html' pod GitHub Pages
    firebase.auth().signOut().then(()=>{ window.location.href = 'index.html' })
  }
}

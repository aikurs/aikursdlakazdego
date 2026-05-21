// CONFIGURATION
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCDSP_ztZ88ftNZwrG_xA5X-9NWmG-rHGA",
  authDomain: "aikursdlakazdego.firebaseapp.com",
  projectId: "aikursdlakazdego",
  storageBucket: "aikursdlakazdego.appspot.com",
  messagingSenderId: "367258079633",
  appId: "1:367258079633:web:651341fc22eefd0b64f9bf"
};

// LOCAL STORAGE UTILS (KV)
const KV = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Error saving to localStorage", e);
    }
  },
  get(key) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch (e) {
      console.error("Error reading from localStorage", e);
      return null;
    }
  },
  remove(key) {
    localStorage.removeItem(key);
  }
};

// GLOBAL USER UTILS
function getUserDisplayName(user) {
  if (!user) return "Uczeń";
  return user.displayName || user.email.split("@")[0];
}

// ACTION CODE SETTINGS FOR INFRASTRUCTURE (Fixes GitHub Pages 404)
const actionCodeSettings = {
  url: 'https://mozzart-games.github.io/aikursdlakazdego/rejestracja.html',
  handleCodeInApp: true
};

// TOAST & ALERTS UTILS
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `show ${type}`;
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 3000);
}

function showAlert(elementId, message) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.style.display = "block";
}

function hideAlert(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.style.display = "none";
}

// COURSE DATA COMPILER
function getKursData() {
  return {
    modules: [
      {
        id: 1,
        title: "Wstęp do Sztucznej Inteligencji",
        lessons: [
          { id: "m1l1", title: "Czym jest AI i jak rewolucjonizuje biznes?", time: "12:45", desc: "<p>W tej lekcji dowiesz się, czym naprawdę jest sztuczna inteligencja i jak zmienia współczesny rynek pracy.</p>", ytId: "dQw4w9WgXcQ" },
          { id: "m1l2", title: "Przegląd ekosystemu narzędzi AI", time: "15:20", desc: "<p>Poznaj najpopularniejsze aplikacje i modele językowe dostępne na rynku.</p>", ytId: "dQw4w9WgXcQ" }
        ]
      },
      {
        id: 2,
        title: "Prompt Engineering w Praktyce",
        lessons: [
          { id: "m2l1", title: "Konstruowanie skutecznych promptów", time: "18:10", desc: "<p>Zasady tworzenia zapytań, które dają precyzyjne wyniki.</p>", ytId: "dQw4w9WgXcQ", homework: "Stwórz prompt automatyzujący odpowiedź na reklamację klienta." },
          { id: "m2l2", title: "Zaawansowane techniki i role-play", time: "22:40", desc: "<p>Jak zmuszać AI do głębszej analizy problemów za pomocą kontekstu ról.</p>", ytId: "dQw4w9WgXcQ" }
        ]
      }
    ]
  };
}

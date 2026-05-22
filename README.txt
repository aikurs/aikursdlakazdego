====================================
NAFFY.AI — PANEL KURSU
====================================

PLIKI:
- index.html    → Strona logowania
- panel.html    → Panel ucznia
- admin.html    → Panel administratora
- style.css     → Style wspólne
- app.js        → Konfiguracja Firebase + dane kursu

====================================
JAK URUCHOMIĆ — KROK PO KROKU
====================================

1. UTWÓRZ PROJEKT FIREBASE
   → Wejdź na console.firebase.google.com
   → Kliknij "Dodaj projekt" → podaj nazwę
   → Włącz Authentication → Email/Password
   → Włącz Firestore Database (tryb testowy na start)

2. SKOPIUJ KONFIGURACJĘ FIREBASE
   → W Firebase Console: Ustawienia projektu → Twoje aplikacje → </> Web
   → Skopiuj obiekt firebaseConfig
   → Wklej do pliku app.js w miejscu FIREBASE_CONFIG (linie 8-15)

3. WGRAJ PLIKI NA HOSTING
   → Możesz użyć: Vercel, Cloudflare Pages, Firebase Hosting
   → Cloudflare Pages (najprościej):
     - Wejdź na pages.cloudflare.com
     - Przeciągnij folder z plikami
     - Gotowe!

4. UTWÓRZ PIERWSZE KONTO ADMINA
   → W Firebase Console → Authentication → Dodaj użytkownika
   → Wpisz e-mail i hasło
   → Zaloguj się na admin.html

5. DODAJ TREŚĆ KURSU
   → Zaloguj się do admin.html
   → Idź do "Zarządzaj kursem"
   → Edytuj lekcje — dodaj ID wideo YouTube, PDF, zadania, quizy
   → Kliknij "Zapisz wszystko do bazy"

6. ZAPROŚ UCZNIÓW
   → W admin.html idź do "Zaproszenia"
   → Wpisz e-mail i hasło startowe ucznia
   → Wyślij dane uczniowi ręcznie (e-mailem, SMS)
   → Uczeń loguje się na index.html

====================================
REGUŁY FIRESTORE (skopiuj do konsoli)
====================================

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /konfiguracja/{doc} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /uczniowie/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /uczniowie/{userId}/{sub}/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /komentarze/{lesId}/wpisy/{docId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
  }
}

====================================
CO ZAWIERA PANEL UCZNIA
====================================
✓ Logowanie mailem i hasłem (Firebase Auth)
✓ Struktura kursu pobierana z Firestore
✓ Postęp każdego ucznia osobno w bazie
✓ Pasek postępu i statystyki
✓ Streak — licznik dni nauki z rzędu
✓ Szacowany czas do końca kursu
✓ Wyszukiwarka lekcji
✓ Odtwarzacz YouTube (lazy load)
✓ Materiały PDF do pobrania
✓ Zadania domowe z zapisem do Firestore
✓ Quiz z pytaniami i oceną procentową
✓ Pytania/komentarze pod lekcją
✓ Notatki z zapisem do Firestore
✓ Osiągnięcia/odznaki (7 sztuk)
✓ Popup z odznaka po odblokowaniu
✓ Tryb ciemny / jasny
✓ Certyfikat po ukończeniu kursu
✓ Wylogowanie działa poprawnie

====================================
CO ZAWIERA PANEL ADMINA
====================================
✓ Przegląd kursu z wskaźnikami
✓ Edytor lekcji (wideo, PDF, zadania, quiz)
✓ Podgląd miniatury YouTube
✓ Zapis kursu do Firestore
✓ Eksport / Import kursu jako JSON
✓ Lista uczniów z postępem i streakiem
✓ Odpowiadanie na pytania uczniów
✓ Tworzenie kont dla nowych uczniów
✓ Reset hasła dla uczniów

====================================

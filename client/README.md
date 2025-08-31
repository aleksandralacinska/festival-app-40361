# Festival PWA

Progresywna aplikacja webowa (PWA) do obsługi międzynarodowego festiwalu.  
Uczestnicy mają szybki dostęp do harmonogramu, mapy i informacji zespołowych.  
Organizatorzy zarządzają treścią w panelu administratora i wysyłają powiadomienia push.

---

## Funkcje

- Publiczny **harmonogram wydarzeń** + szczegóły.
- **Mapa** lokalizacji festiwalu (sceny, hotele, info itd.).
- **PIN dla zespołów** (JWT) → widok planu i noclegu.
- **Wielojęzyczność (PL/EN)** z fallbackiem; admin wprowadza treści w 2 językach (PL, EN).
- **Powiadomienia push** (Web Push) + przypomnienia przed wydarzeniem T-30/T-15.
- **PWA**: tryb offline, instalacja na ekranie głównym, Service Worker.
- **Panel admina**: wydarzenia, lokalizacje, zespoły, push, reset PIN, logowanie/wylogowanie.

---

## Widoki

### Użytkownik
- **Harmonogram** – lista publicznych wydarzeń z opisem.
- **Mapa** – punkty zainteresowania z typami (stage/hotel/info itd.).
- **Zespół** – logowanie PIN (JWT) i podgląd własnych wydarzeń + nocleg => przykład: elk#1234.
- **Ustawienia** – wybór języka, włącz/wyłącz powiadomienia, przycisk instalacji PWA.

### Administrator
- **/admin/login** – logowanie (domyślnie `admin`/`admin`).
- **Wydarzenia** – CRUD, przypisanie do zespołu/lokalizacji, kategorie public/team, pola PL/EN.
- **Lokalizacje** – CRUD, typ, współrzędne, pola PL/EN.
- **Zespoły** – dodawanie, reset/ustaw PIN.
- **Push** – broadcast do wszystkich lub do jednego zespołu; uruchamianie przypomnień.
- **Wyloguj** – przycisk w menu bocznym.

---

## Technologie

- **Frontend**: React + Vite, React Router, i18next, Font Awesome, Google Maps API, `vite-plugin-pwa` (tryb `injectManifest`).
- **Backend**: Node.js + Express, PostgreSQL (`pg`), JWT, `bcrypt`, `web-push`.
- **PWA**: Service Worker (cache/offline/push), manifest, instalacja.
- **Baza**: PostgreSQL (np. Render.com albo lokalnie).

---

## Architektura

- `/client` – SPA PWA (React, Vite, własny service worker w `src/sw.js`).
- `/server` – REST API (Express) + obsługa Web Push + endpoint przypomnień.
- Baza: tabele m.in. `events`, `locations`, `teams`, `push_subscriptions`, `event_reminder_log`.
- i18n: w `events` i `locations` istnieją kolumny `name_pl/en`, `description_pl/en` (fallback do bazowych pól `name`/`description`).

---

## Wymagania

- **Node.js 20.19+** lub **22.12+**  
  (Uwaga: Vite nie wspiera Node 22.11 – zaktualizuj w razie potrzeby).
- **Git**
- **PostgreSQL** (lokalnie lub zewnętrznie)
- (Opcjonalnie) **VS Code**

---

## Instalacja i uruchomienie lokalne

### Instalacja zależności

**Backend**
cd server
npm ci

**Frontend**
cd ../client
npm ci


### Uruchomienie backendu (server)

cd server
npm run dev
// API: http://localhost:4000

### Uruchomienie frontendu (client)

cd client
npm run dev
// App: http://localhost:5173

---

## Struktura repozytorium
.
├─ client/                      # React + Vite (PWA)
│  ├─ public/                   # ikony, manifest, assets
│  ├─ src/
│  │  ├─ pages/                 # widoki (użytkownik + admin)
│  │  ├─ services/              # klient API, auth, i18n, itp.
│  │  ├─ i18n/                  # pl/en
│  │  ├─ sw.js                  # service worker (injectManifest)
│  │  ├─ main.jsx, App.jsx
│  │  └─ index.css, App.css
│  └─ vite.config.js
└─ server/                      # Express API
   ├─ src/
   │  ├─ routes/                # events, locations, teams, push, auth, admin
   │  ├─ services/              # pushService.js (Web Push)
   │  ├─ middleware/            # requireAdmin, validators
   │  └─ server.js              # bootstrap aplikacji, CORS, JSON, mounty
   └─ config/
      └─ db.js                  # pg.Pool (PostgreSQL)


# 🧾 DONC PDF-Server – Monorepo für Node.js + React-Admin

Dieses Projekt stellt eine API-basierte Plattform zur PDF-Generierung für verschiedene Report-Typen (wie "Declaration of Decontamination") bereit. Es kombiniert einen Express-Server mit einer React-basierten Admin-Oberfläche – alles in einem Repository für einfache Deploys.

---

## 📁 Projektstruktur

```text
/
├── server.js              # Node.js Express-Server
├── package.json           # Backend-Abhängigkeiten und Start-Logik
├── admin.js               # React-Admin-Integration als Middleware
├── templates/             # HTML/CSS-Templates für PDF
├── admin-app/             # React-App für Template-Test & Upload
│   ├── public/
│   ├── src/
│   └── build/             # Wird durch React erzeugt
└── openapi.json           # OpenAPI-Spezifikation der PDF-API
```

---

## 🚀 Deploy auf Render.com

### 🔧 Build Command (Render.com → Settings → Build & Deploy)

```bash
cd admin-app && npm install && npm run build && cd .. && npm install
```

### ▶️ Start Command

```bash
npm start
```

### 🌐 Routen

| Route                 | Beschreibung                         |
| --------------------- | ------------------------------------ |
| `/generate/:template` | JSON-Post-Endpunkt zur PDF-Erzeugung |
| `/openapi.json`       | OpenAPI-Dokumentation                |
| `/api-docs`           | Swagger UI für die API               |
| `/admin`              | React-Webinterface für Admin/Test    |

---

## 🛠 Lokale Entwicklung

### Backend starten:

```bash
npm install
npm start
```

### Frontend starten:

```bash
cd admin-app
npm install
npm start
```

→ läuft unter `http://localhost:3000` (mit Proxy-Forwarding zum Backend)

### Frontend builden (für Render oder Produktivbetrieb):

```bash
cd admin-app
npm run build
```

---

## 📤 Hinweise für GitHub-Nutzer

* Stelle sicher, dass der `build/`-Ordner im Repo **nicht durch **\`\`** ausgeschlossen** ist
* Falls doch, nutze: `git add -f admin-app/build`

---

## 🧠 Weiterentwicklungsideen

* Template-Upload im UI
* JSON-Vorschlag & Syntax-Check
* Mehrsprachige Preview
* Admin-Zugriff absichern (API-Key / Login)

---

© Zwernemann Medienentwicklung – 2025

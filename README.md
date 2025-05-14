
# 📄 PDF-Server – Dynamische PDF-Erzeugung aus HTML-Templates

Ein leistungsfähiger Node.js-Service zur serverseitigen PDF-Erzeugung aus HTML-Templates. Unterstützt mehrere Template-Engines (Handlebars, Liquid, Nunjucks) und bietet ein React-Frontend zur Verwaltung, Vorschau und Pflege von Vorlagen.

---

## 🚀 Highlights

- 🧠 **Multi-Engine Support**: Handlebars, Liquid, Nunjucks
- 🖋️ **Templating via JSON oder ZIP**
- 🌐 **REST-API mit Endpunkten zur Verwaltung und Generierung**
- 🧪 **Web-Frontend** zum Testen und Hochladen von Templates
- 🔐 **CORS und Umgebungsvariablen** via `.env`
- 🐳 **Docker- und Cloud-ready** (z. B. Render, Heroku)

---

## 🗂️ Projektstruktur

```plaintext
.
├── server.js                    # Haupt-Express-Server
├── admin.js                    # Admin-Router
├── templates/                  # Template-Verzeichnis (HTML, Assets, JSON)
├── fonts/                      # Schriftartenverzeichnis
├── admin-app/                  # React-Frontend
├── openapi/pdf-server.openapi.yaml # API-Spezifikation
├── .env                        # Umgebungsvariablen
└── render.yaml / Dockerfile    # Deployment-Konfigurationen
```

---

## ⚙️ Setup

```bash
git clone https://github.com/Zwernemann/pdf-server.git
cd pdf-server
npm install
cp .env.example .env
npm start
```

Admin-Frontend starten:
```bash
cd admin-app
npm install
npm run dev
```

---

## 📬 API-Endpunkte

### `GET /api/templates`
→ Liste aller verfügbaren Templates

### `GET /api/template/{templateName}`
→ Gibt den Inhalt eines Templates zurück

### `POST /api/template/{templateName}`
→ Speichert oder überschreibt ein Template

### `POST /api/templates/upload`
→ Upload eines neuen Templates (ZIP, HTML, JSON)

### `POST /api/generate/{templateName}`
→ Generiert ein PDF anhand des Templates und der übermittelten JSON-Daten

### `POST /api/generate/donc`
→ Spezieller Generator für "Declaration of Non-Contamination" PDFs

---

## 📄 Beispielaufruf (cURL)

```bash
curl -X POST http://localhost:3000/api/generate/green/template.handlebars \
     -H "Content-Type: application/json" \
     -d '{
           "data": {
             "title": "Dekontaminationserklärung",
             "flammable": true
           }
         }' --output output.pdf
```

---

## 🧠 Templates

Unterstützt:
- `.handlebars` (via Handlebars)
- `.liquid` (via LiquidJS)
- `.njk` (via Nunjucks)

---

## 🌍 .env-Beispiel

```dotenv
PORT=3000
TEMPLATE_ROOT=./templates
ALLOWED_CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## 🛠 Deployment

Bereit für Cloud-Plattformen:
- Docker: `docker build -t pdf-server .`
- Render.com mit `render.yaml`
- Heroku über `Procfile`

---

## 🧪 Admin-Frontend

React-App zur lokalen Template-Verwaltung:
- Live-Vorschau
- Hochladen von Templates und JSON
- Editor mit Syntax-Highlighting

Erreichbar unter: `http://localhost:3000/admin`

---

## 📘 API-Spezifikation

Die vollständige API ist in `openapi/pdf-server.openapi.yaml` dokumentiert.  
Importiere sie direkt in Swagger UI oder Postman.

---

## 📄 Lizenz

MIT License – frei nutzbar. Attribution willkommen.

> © Zwernemann Medienentwicklung – powered by Reporting Know-How und Liebe zum Pixel.


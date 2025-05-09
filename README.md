
# PDF Server

**Skalierbarer Node.js-basierter Microservice zur dynamischen PDF-Erzeugung aus HTML-, Handlebars-, Nunjucks- und LiquidJS-Vorlagen**  
**by Zwernemann Medienentwicklung**

## 🧩 Überblick

Der PDF-Server ist ein modular aufgebauter, containerisierbarer Microservice zur serverseitigen PDF-Generierung. Er ermöglicht es, JSON-Daten mithilfe von HTML-Templates (Handlebars, Nunjucks oder LiquidJS) in exakt definierte PDF-Dokumente zu rendern – etwa für Reports, Zertifikate oder Lieferscheine. Die Ausführung erfolgt performant über Puppeteer (Headless Chrome) mit speziellem Font- und Template-Handling.

## 🚀 Features

- ⚙️ **REST API** zur Annahme von Daten und Auslieferung generierter PDFs
- 📄 **Support für mehrere Template Engines:** Handlebars, Nunjucks, LiquidJS
- 🎨 **Individuelle Fonts** (z. B. E+H Sans) direkt eingebettet
- 🗃️ **Admin-Oberfläche** (React) zum Testen und Verwalten von Templates
- 🐳 **Docker- und Render.com-Deployment** vorbereitet
- 🔒 Sicherer Datei-Upload per Multer
- 🔁 Unterstützung für ZIP-Archive mit Templates
- 📁 Trennung zwischen statischen `template/`- und runtime-generierten `templates/`-Verzeichnissen

## 📂 Projektstruktur

```plaintext
pdf-server/
│
├── server.js               # Hauptserver für PDF-Generierung (Express + Puppeteer)
├── package.json            # Serverseitige Dependencies
├── admin-app/              # React-basierte Admin UI
├── template/               # Beispiel-Template mit HTML & JSON
├── templates/              # Dynamisch hochgeladene Templates
├── fonts/                  # Eingebettete TrueType-Fonts (E+H)
├── .github/workflows/     # CI/CD Pipeline (Render.com)
├── Dockerfile              # Production-Image für Container-Deployments
├── render.yaml             # Render.com Config File
└── README.md               # Diese Datei
```

## 🛠️ Technologie-Stack

| Bereich            | Technologie                                |
|--------------------|---------------------------------------------|
| Backend            | Node.js (Express)                          |
| PDF-Engine         | Puppeteer (Headless Chromium)              |
| Template Engines   | Handlebars, Nunjucks, LiquidJS             |
| Uploads            | Multer                                     |
| Frontend (Admin)   | React + TailwindCSS                        |
| Deployment         | Docker, Render.com                         |
| Schriftarten       | TrueType (TTF), eingebettet als Base64     |
| CI/CD              | GitHub Actions                             |

## 📐 Template-System

Der PDF-Server unterstützt drei populäre Templating-Systeme:

| Engine      | Syntaxstil                        | Dateiendung    | Besondere Merkmale                            |
|-------------|------------------------------------|----------------|-----------------------------------------------|
| Handlebars  | `{{variable}}`                     | `.hbs.html`    | Logikarm, ideal für simple Placeholder         |
| Nunjucks    | `{% block %}`, `{{ var }}`         | `.njk.html`    | mächtiger Jinja2-ähnlicher Syntax              |
| LiquidJS    | `{{ variable }}`, `{% if %}`       | `.liquid.html` | Shopify-kompatibel, sicher und populär im Web |

**Automatische Erkennung:** Die Engine wird anhand der Dateiendung des Templates erkannt. Beispiel:

```json
{
  "template": "zertifikat.njk.html",
  "data": { ... }
}
```

## 🔧 Lokale Entwicklung

### Voraussetzungen

- Node.js ≥ 18
- npm
- Docker (optional)
- Git

### Setup

```bash
git clone https://github.com/Zwernemann/pdf-server.git
cd pdf-server
npm install
```

### Starten des Servers

```bash
npm start
```

Der Server lauscht standardmäßig auf Port `3000`.

## 🌐 API-Endpunkte

### `POST /generate`

Generiert ein PDF auf Basis eines Templates und JSON-Datensatzes.

**Header:**
- `Content-Type: application/json`

**Body-Beispiel:**
```json
{
  "template": "donc-template.njk.html",
  "data": {
    "assetNumber": "TA12345",
    "customer": "Hanse Merkur"
  }
}
```

**Antwort:**
PDF-Datei im MIME-Typ `application/pdf`.

## 🧪 Admin-Oberfläche

Pfad: `/admin`

Features:
- Template-Upload via ZIP
- JSON-Payloads testen
- Live-PDF-Vorschau (im Browser)
- Re-Upload von Fonts/Templates

### Admin-App separat starten (optional)

```bash
cd admin-app
npm install
npm start
```

Für Production ist die App bereits vorgebaut im `build/`-Ordner eingebunden.

## 🐳 Docker Deployment

```bash
docker build -t pdf-server .
docker run -p 3000:3000 pdf-server
```

### Mit Render.com

Bereits vorbereitet durch:
- `Dockerfile`
- `render.yaml`
- GitHub Actions Workflow

Push auf `main` → automatisch deploybar über Render.

## 📦 Template-Pakete

Du kannst eigene Templates als `.zip` hochladen, die folgende Struktur enthalten:

```
template-name.zip
├── template.njk.html
├── data.json
├── logo.svg
└── styles.css
```

Nach Upload steht das Template sofort über `/generate` zur Verfügung.

## 🔐 Sicherheit

- Input-Sanitization auf Pfade und Dateinamen
- Limitiertes `bodyParser`-Limit (10MB)
- Helm für HTTP-Header-Härtung (optional nachrüstbar)
- TODO: JWT-/API-Key-Schutz für `/admin`

## 📚 Weiterentwicklungsideen

- [ ] Template-Versionsverwaltung mit Git
- [ ] Benutzerrollen im Adminbereich
- [ ] Mehrsprachige PDF-Generierung aus JSON-Keys
- [ ] WebSocket-basiertes Preview-Modul
- [ ] Font-Serving als Webservice statt Base64-Einbettung

## ✨ Autor

**Zwernemann Medienentwicklung**  
Individuelle Reporting-Lösungen für Salesforce, SAP, B2B-Portale und Embedded-Systeme.

> Kontakt: martin@zwernemann.de  
> Web: [www.zwernemann.de](https://www.zwernemann.de)

## 📄 Lizenz

MIT License – feel free to use, modify, and contribute.

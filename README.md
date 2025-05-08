# 📄 PDF Template Management Platform

Dieses Projekt bietet eine vollständige Plattform zur Erzeugung von PDFs aus HTML-Templates – kombiniert mit einem Admin-Frontend für Upload, Vorschau und visuelles Editieren per Drag & Drop.

## 🔧 Features

- 🧠 **PDF-Rendering via Node.js & Puppeteer**
- 🧰 **Visueller HTML-Editor (GrapesJS + Plugins)**
- 📤 **Upload von HTML/CSS Templates als ZIP**
- 📁 **Verzeichnisbrowsing & Preview existierender Templates**
- 🎯 **Tailwind CSS für modernes, responsives UI**
- 🧭 **React Router zur Navigation zwischen Seiten**

## 📦 Projektstruktur

```
.
├── server.js             # Express-Server mit PDF-API, Upload-Handler, Template-Liste
├── templates/            # Ordner mit allen hochgeladenen Templates (entpackt)
├── admin-app/            # React-Frontend mit Editor, Upload, Preview
│   ├── src/
│   │   ├── App.js
│   │   ├── Home.js
│   │   ├── TemplateEditor.js
│   │   ├── UploadForm.js
│   │   └── index.css
│   └── build/            # Build-Ordner (wird automatisch generiert)
```

## 🚀 Backend starten

```bash
npm install
npm run start
```

### Endpunkte

| Methode | Pfad                        | Beschreibung                               |
|--------:|-----------------------------|--------------------------------------------|
| `POST`  | `/generate/:templateName`   | Generiert PDF aus Template + JSON          |
| `POST`  | `/api/upload-template`      | Lädt ZIP-Datei hoch und entpackt sie       |
| `GET`   | `/api/templates`            | Liefert Liste aller verfügbaren Templates  |

## 🖥 Frontend verwenden

```bash
cd admin-app
npm install
npm run build
```

> 📁 Danach den `/build`-Ordner ins Hauptprojekt kopieren oder per Express in `admin.js` einbinden.

### Features im Frontend

- Upload ZIP-Dateien mit HTML-Templates
- Ansicht und Auswahl existierender Templates
- PDF-Preview durch JSON-Testdaten
- Visueller HTML-Editor mit `grapesjs`, `preset-webpage`, `plugin-forms` und `parser-postcss`

## ✨ Technologien

- **Node.js + Express**
- **React + React Router**
- **Tailwind CSS**
- **Puppeteer**
- **GrapesJS** (v0.22.7) mit:
  - `grapesjs-preset-webpage`
  - `grapesjs-plugin-forms`
  - `grapesjs-parser-postcss`

## 📌 Hinweise

- Templates bestehen aus **HTML + CSS** und werden automatisch geparsed.
- Alle JSON-Daten zur PDF-Generierung werden dynamisch übergeben.
- Es können mehrere Templates gleichzeitig verwaltet und getestet werden.

## 💬 Weiteres

Bei Fragen, Feature-Wünschen oder Integration in andere Systeme – gerne Kontakt aufnehmen oder ein Issue eröffnen.

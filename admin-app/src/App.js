import React, { useState, useEffect } from "react";
import "./App.css";
import UploadForm from './UploadForm';

export default function App() {
  const [template, setTemplate] = useState("");
  const [json, setJson] = useState("{}");
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(setTemplates)
      .catch(err => console.error('Fehler beim Laden der Template-Liste:', err));
  }, []);

  const handleGenerate = async () => {
    const response = await fetch(`/generate/${template}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Admin-Oberfläche</h1>

      <h2>Vorhandene Templates</h2>
      <ul>
        {templates.map((name, i) => (
          <li key={i} onClick={() => setTemplate(name)} style={{ cursor: 'pointer', color: 'blue' }}>{name}</li>
        ))}
      </ul>

      <hr />

      <h2>PDF Template Test</h2>
      <label>Template name: <input value={template} onChange={e => setTemplate(e.target.value)} /></label>
      <br />
      <textarea rows="20" cols="80" value={json} onChange={e => setJson(e.target.value)} />
      <br />
      <button onClick={handleGenerate}>Generate PDF</button>

      <hr />

      <h2>Template Upload</h2>
      <UploadForm />
    </div>
  );
}

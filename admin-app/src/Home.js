import React, { useState, useEffect } from "react";
import UploadForm from './UploadForm';

export default function Home() {
  const [template, setTemplate] = useState("");
  const [json, setJson] = useState("{}");
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(setTemplates)
      .catch(err => console.error('Fehler beim Laden der Template-Liste:', err));
  };

  const handleGenerate = async () => {
    const response = await fetch(`/api/generate/${template}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold text-center text-gray-900">PDF Admin-Konsole</h1>

        <section className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold mb-4">📦 Vorhandene Templates</h2>
          <ul className="space-y-1">
            {templates.map((name, i) => (
              <li key={i}>
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => setTemplate(name)}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold mb-4">🧪 PDF-Test</h2>
          <div className="space-y-4">
            <label className="block">
              <span className="text-gray-700">Template-Name</span>
              <input
                className="mt-1 w-full border rounded px-3 py-2"
                value={template}
                onChange={e => setTemplate(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-gray-700">JSON-Daten</span>
              <textarea
                rows="10"
                className="mt-1 w-full border rounded px-3 py-2 font-mono"
                value={json}
                onChange={e => setJson(e.target.value)}
              />
            </label>
            <button
              onClick={handleGenerate}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              ➕ PDF generieren
            </button>
          </div>
        </section>

        <section className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold mb-4">📤 Template hochladen</h2>
          <UploadForm onUploadSuccess={loadTemplates} />
        </section>
      </div>
    </div>
  );
}

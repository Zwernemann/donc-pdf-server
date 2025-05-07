import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [template, setTemplate] = useState("");
  const [json, setJson] = useState("{}");

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
    <div>
      <h1>PDF Template Test</h1>
      <label>Template name: <input value={template} onChange={e => setTemplate(e.target.value)} /></label>
      <br />
      <textarea rows="20" cols="80" value={json} onChange={e => setJson(e.target.value)} />
      <br />
      <button onClick={handleGenerate}>Generate PDF</button>
    </div>
  );
}

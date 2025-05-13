import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router-dom';

export default function MustacheEditor() {
  const { templateName } = useParams();
  const iframeRef = useRef(null);
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [filename, setFilename] = useState(null);

  useEffect(() => {
    async function loadTemplate() {
      try {
        const res = await fetch(`/api/template/${templateName}`);
        if (!res.ok) {
          throw new Error(`HTTP-Fehler: ${res.status}`);
        }
        const { content, filename } = await res.json();
        console.log('Geladenes Template:', content); // Debugging

        // Regex für <style>-Tag
        const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        const cssContent = styleMatch ? styleMatch[1].trim() : '';
        console.log('Extrahierter CSS-Inhalt:', cssContent); // Debugging

        // Entferne <style>-Tag aus dem HTML
        const htmlWithoutStyle = content.replace(/<style[^>]*>[\s\S]*?<\/style>/i, '').trim();
        console.log('HTML ohne Style:', htmlWithoutStyle); // Debugging

        setHtml(htmlWithoutStyle);
        setCss(cssContent);
        setFilename(filename);
      } catch (err) {
        console.error('Fehler beim Laden des Templates:', err);
      }
    }
    loadTemplate();
  }, [templateName]);

  useEffect(() => {
    const full = `<html><head><style>${css}</style></head><body>${html}</body></html>`;
    if (iframeRef.current) {
      iframeRef.current.srcdoc = full;
    }
  }, [html, css]);

  const handleExport = async () => {
    const payload = { html, css };
    try {
      const response = await fetch('http://localhost:5000/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP-Fehler: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'export.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Fehler beim Export: ' + error.message);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0.5em', display: 'flex', justifyContent: 'space-between' }}>
        <h2>Mustache Template Editor (Monaco)</h2>
        <button onClick={handleExport}>Exportiere als PDF</button>
      </div>
      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
          <Editor
            height="50%"
            defaultLanguage="html"
            value={html}
            onChange={value => setHtml(value || '')}
            theme="vs-dark"
          />
          <Editor
            height="50%"
            defaultLanguage="css"
            value={css}
            onChange={value => setCss(value || '')}
            theme="vs-dark"
          />
        </div>
        <iframe
          ref={iframeRef}
          title="Vorschau"
          style={{ width: '50%', height: '100%', border: 'none' }}
        />
      </div>
    </div>
  );
}
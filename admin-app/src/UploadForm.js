
import React, { useState } from 'react';

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !templateName) {
      alert('Bitte ZIP-Datei und Namen angeben.');
      return;
    }

    const formData = new FormData();
    formData.append('templateZip', file);
    formData.append('templateName', templateName);

    const res = await fetch('/api/upload-template', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    setStatus(JSON.stringify(data));
  };

  return (
    <div>
      <h2>Template Upload</h2>
      <form onSubmit={handleSubmit}>
        <label>Template-Name: <input value={templateName} onChange={e => setTemplateName(e.target.value)} /></label><br />
        <input type='file' accept='.zip' onChange={e => setFile(e.target.files[0])} /><br />
        <button type='submit'>Hochladen</button>
      </form>
      <pre>{status}</pre>
    </div>
  );
}

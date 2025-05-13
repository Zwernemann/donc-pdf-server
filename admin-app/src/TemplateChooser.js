import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TemplateChooser({ target = 'editor' }) {
  const [templates, setTemplates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(setTemplates)
      .catch(console.error);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">
        {target === 'editor' ? 'GrapesJS Template auswählen' : 'Mustache Template auswählen'}
      </h1>
      <ul className="space-y-2">
        {templates.map(name => (
          <li key={name}>
            <button
              onClick={() => navigate(`/${target}/${name}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

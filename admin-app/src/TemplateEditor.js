import React, { useEffect } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';

export default function TemplateEditor() {
  useEffect(() => {
    grapesjs.init({
      container: '#gjs',
      fromElement: true,
      height: '100vh',
      width: 'auto',
      storageManager: false,
    });
  }, []);

  return (
    <div className="bg-white">
      <div id="gjs">
        <h1>Start your template here</h1>
        <p>Drag and drop components from the sidebar</p>
      </div>
    </div>
  );
}

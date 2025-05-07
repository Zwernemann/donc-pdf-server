import React, { useEffect } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';

import presetWebpage from 'grapesjs-preset-webpage';
import pluginForms from 'grapesjs-plugin-forms';
import parserPostCSS from 'grapesjs-parser-postcss';

export default function TemplateEditor() {
  useEffect(() => {
    grapesjs.init({
      container: '#gjs',
      height: '100vh',
      width: 'auto',
      fromElement: false,
      components: '',
      style: '',
      storageManager: false,
      plugins: [presetWebpage, pluginForms, parserPostCSS],
      pluginsOpts: {
        [presetWebpage]: {},
        [pluginForms]: {},
        [parserPostCSS]: {}
      }
    });
  }, []);

  return (
    <div className="bg-white">
      <div id="gjs" className="h-screen" />
    </div>
  );
}

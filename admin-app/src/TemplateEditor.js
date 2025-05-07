import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';

import presetWebpage from 'grapesjs-preset-webpage';
import pluginForms from 'grapesjs-plugin-forms';

import parserPostCSS from 'grapesjs-parser-postcss';

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
      <div id="gjs" className="bg-white border h-full">
        <h1>Start your template here</h1>
        <p>Drag and drop components from the sidebar</p>
      </div>
    </div>
  );
}

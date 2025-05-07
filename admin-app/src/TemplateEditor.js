import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';

import presetWebpage from 'grapesjs-preset-webpage';
import pluginForms from 'grapesjs-plugin-forms';

useEffect(() => {
  grapesjs.init({
    container: '#gjs',
    fromElement: false,
    height: '100vh',
    width: 'auto',
    storageManager: false,
    plugins: [presetWebpage, pluginForms],
    pluginsOpts: {
      [presetWebpage]: {},
      [pluginForms]: {}
    }
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

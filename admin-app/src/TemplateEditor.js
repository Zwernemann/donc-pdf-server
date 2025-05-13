import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';

import presetWebpage from 'grapesjs-preset-webpage';
import pluginForms from 'grapesjs-plugin-forms';
import parserPostCSS from 'grapesjs-parser-postcss';

function TemplateEditor() {
  const { templateName } = useParams();
  const [filename, setFilename] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (!templateName) return;

    async function initEditor() {
      const res = await fetch(`/api/template/${templateName}`);
      let { content, filename } = await res.json();


// Rücktransformation von [[#if]] etc. in editor-lesbare Struktur
content = content
  .replace(/\[\[#if\s+([^\]]+?)\s*\]\]/gi, '<div class="gjs-if-block" data-condition="$1">')
  .replace(/\[\[#unless\s+([^\]]+?)\s*\]\]/gi, '<div class="gjs-unless-block" data-condition="$1">')
  .replace(/\[\[else\s*\]\]/gi, '<div class="gjs-else-block">')
  .replace(/\[\[\/if\s*\]\]/gi, '</div>')
  .replace(/\[\[\/unless\s*\]\]/gi, '</div>');



      setFilename(filename);

      const editor = grapesjs.init({
        container: '#gjs',
        height: '100vh',
        width: 'auto',
        fromElement: false,
        components: content,
        style: '',
        storageManager: false,
        plugins: [presetWebpage, pluginForms, parserPostCSS],
        pluginsOpts: {
          [presetWebpage]: {},
          [pluginForms]: {},
          [parserPostCSS]: {}
        }
      });

      const style = document.createElement('style');
      style.innerHTML = `
        .gjs-if-block, .gjs-else-block, .gjs-unless-block {
          border: 1px dashed #999;
          background-color: #f9f9f9;
          padding: 10px;
          margin: 5px 0;
        }
      `;
      document.head.appendChild(style);

      const logicBlocks = [
        {
          id: 'if-block',
          label: 'If-Bedingung',
          type: 'if-block',
          attrs: { class: 'fa fa-code' },
          defaultAttr: 'data-condition',
          logicTag: 'if'
        },
        {
          id: 'else-block',
          label: 'Else',
          type: 'else-block',
          attrs: { class: 'fa fa-random' },
          logicTag: 'else'
        },
        {
          id: 'unless-block',
          label: 'Unless-Bedingung',
          type: 'unless-block',
          attrs: { class: 'fa fa-ban' },
          defaultAttr: 'data-condition',
          logicTag: 'unless'
        }
      ];

      logicBlocks.forEach(({ id, label, type, attrs, defaultAttr }) => {
        const contentObj = {
          type,
          components: [
            {
              type: 'text',
              content: 'Bedingter Inhalt'
            }
          ]
        };

        if (defaultAttr && typeof defaultAttr === 'string') {
          contentObj.attributes = {};
          contentObj.attributes[defaultAttr] = '';
        }

        editor.BlockManager.add(id, {
          label,
          category: 'Logik',
          attributes: attrs,
          content: contentObj
        });

        const modelDefaults = {
          tagName: 'div',
          droppable: true,
          stylable: false,
          highlightable: true,
          copyable: true,
          classes: [`gjs-${id}`],
          attributes: {},
          traits: []
        };

        if (defaultAttr && typeof defaultAttr === 'string') {
          modelDefaults.attributes[defaultAttr] = '';
          modelDefaults.traits.push({ type: 'text', name: defaultAttr, label: 'Bedingung' });
        }

        editor.DomComponents.addType(type, {
          model: {
            defaults: modelDefaults
          },
          view: {
            init() {
              if (defaultAttr) {
                this.listenTo(this.model, `change:attributes:${defaultAttr}`, this.render);
              }
            },
            render() {
              console.log('[render]', {
                id: this.model.get('id'),
                attributes: this.model.getAttributes(),
                components: this.model.get('components')?.models?.map(c => c.attributes),
              });
              const val = defaultAttr ? (this.model.getAttributes()[defaultAttr] || '(?)') : label;
              this.el.innerHTML = `
                <div style="font-size: 11px; font-weight: bold; margin-bottom: 4px; color: #555;">
                  ${label}: <code>${val}</code>
                </div>
                <div data-gjs-type="default">${this.model.get('components').map(c => c.toHTML()).join('')}</div>
              `;
              return this;
            }
          }
        });
      });

      editor.Panels.addButton('options', {
        id: 'save-template',
        className: 'fa fa-save',
        command: 'save-template',
        attributes: { title: 'Speichern' }
      });

      editor.Commands.add('save-template', {
        run: async () => {
          let html = editor.getHtml();

          // Transformiere Logikkomponenten zurück in [[#if ...]] usw.
          html = html.replace(/<div[^>]*class=["']gjs-if-block["'][^>]*data-condition=["'](.*?)["'][^>]*>([\s\S]*?)<\/div>/g, (_, cond, content) => `[[#if ${cond}]]\n${content}\n[[/if]]`);
          html = html.replace(/<div[^>]*class=["']gjs-unless-block["'][^>]*data-condition=["'](.*?)["'][^>]*>([\s\S]*?)<\/div>/g, (_, cond, content) => `[[#unless ${cond}]]\n${content}\n[[/unless]]`);
          html = html.replace(/<div[^>]*class=["']gjs-else-block["'][^>]*>([\s\S]*?)<\/div>/g, (_, content) => `[[else]]\n${content}`);

          const resp = await fetch(`/api/template/${templateName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: html, filename })
          });

          if (resp.ok) {
            alert('Template gespeichert ✅');
          } else {
            alert('Fehler beim Speichern ❌');
          }
        }
      });

      editorRef.current = editor;
    }

    initEditor();
  }, [templateName]);

  return (
    <div className="bg-white">
      <div id="gjs" className="h-screen" />
    </div>
  );
}

export default TemplateEditor;

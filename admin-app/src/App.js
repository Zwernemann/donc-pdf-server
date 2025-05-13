import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import TemplateChooser from './TemplateChooser';
import TemplateEditor from './TemplateEditor';
import MustacheEditor from './MustacheEditor'; // ⬅️ importieren

export default function App() {
  return (
    <Router>
      <nav className="bg-white shadow p-4 flex gap-4">
        <Link to="/" className="text-blue-600 hover:underline">Home</Link>
        <Link to="/editor" className="text-blue-600 hover:underline">Template Editor</Link>
        <Link to="/mustache" className="text-blue-600 hover:underline">Mustache Editor</Link> {/* ✅ NEU */}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />

        {/* GrapesJS-Editor */}
        <Route path="/editor" element={<TemplateChooser target="editor" />} />
        <Route path="/editor/:templateName" element={<TemplateEditor />} />

        {/* Mustache-Editor */}
        <Route path="/mustache" element={<TemplateChooser target="mustache" />} />
        <Route path="/mustache/:templateName" element={<MustacheEditor />} />
      </Routes>
    </Router>
  );
}

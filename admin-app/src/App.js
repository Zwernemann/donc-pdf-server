import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import TemplateEditor from './TemplateEditor';

export default function App() {
  return (
    <Router>
      <nav className="bg-white shadow p-4 flex gap-4">
        <Link to="/" className="text-blue-600 hover:underline">Home</Link>
        <Link to="/editor" className="text-blue-600 hover:underline">Template Editor</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={<TemplateEditor />} />
      </Routes>
    </Router>
  );
}

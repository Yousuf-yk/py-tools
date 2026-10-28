import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PdfOptimizer from './pages/PdfOptimizer';
import TextExtractorTool from './pages/TextExtractorTool';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/optimize" element={<PdfOptimizer />} />
        <Route path="/extract" element={<TextExtractorTool />} />
      </Routes>
    </Router>
  );
}

export default App;
import React, { useState } from 'react';
import { UploadCloud, FileText, Download, Loader2, CheckSquare } from 'lucide-react';

const TextExtractorTool = () => {
  const [file, setFile] = useState(null);
  const [pagesPerSheet, setPagesPerSheet] = useState(4);
  const [bwMode, setBwMode] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const BACKEND_URL = 'http://localhost:5000';

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);

    const formData = new FormData();
    formData.append('pdfFile', file);
    formData.append('pagesPerSheet', pagesPerSheet);
    formData.append('bwMode', bwMode);

    try {
      const response = await fetch(`${BACKEND_URL}/api/extract-text`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to extract text');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `TextFlow_${file.name}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error(error);
      alert('Error extracting text. Check the backend terminal.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans p-4 md:p-8">
      
      {/* Header */}
      <div className="w-full max-w-3xl mx-auto flex items-center space-x-3 mb-8">
        <FileText className="text-red-600 w-8 h-8" />
        <h1 className="text-gray-800 text-2xl font-bold">Pure Text Extractor</h1>
      </div>

      <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
        
        {/* Upload Box */}
        <div className="bg-gray-200 border-2 border-dashed border-gray-400 p-8 rounded-lg flex flex-col items-center justify-center text-center">
          <div className="bg-[#ffe135] p-4 rounded-full mb-4 shadow-sm">
            <UploadCloud className="w-8 h-8 text-gray-800" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {file ? file.name : 'Upload PDF to Extract Text'}
          </h2>
          <label className="cursor-pointer mt-4 bg-gray-800 text-white px-6 py-2 rounded-md font-medium hover:bg-gray-700 transition-colors">
            <span>{file ? 'Change File' : 'Select File'}</span>
            <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        {/* Settings Panel */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">Layout Settings</h3>
          
          <div className="flex flex-col gap-5">
            {/* Forced Extraction Checkbox */}
            <label className="flex items-center gap-3 cursor-not-allowed opacity-80">
              <CheckSquare className="w-6 h-6 text-red-600" />
              <span className="font-semibold text-gray-800">Extract Text to New PDF (Removes Formatting)</span>
            </label>

            {/* B&W Checkbox */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={bwMode} 
                onChange={(e) => setBwMode(e.target.checked)}
                className="w-5 h-5 accent-red-600"
              />
              <span className="font-medium text-gray-700">Black & White Text (Ink Saver)</span>
            </label>

            {/* Grid Radio Buttons */}
            <div className="flex flex-col gap-3 mt-2">
              <span className="font-medium text-gray-700">Pages per Sheet:</span>
              <div className="flex gap-4">
                <label className={`flex-1 border-2 p-3 rounded-md text-center cursor-pointer transition-all ${pagesPerSheet === 2 ? 'border-[#ffe135] bg-[#ffe135] text-gray-900 font-bold' : 'border-gray-300 bg-white text-gray-600'}`}>
                  <input type="radio" name="pages" value={2} className="hidden" checked={pagesPerSheet === 2} onChange={() => setPagesPerSheet(2)} />
                  2 Pages (Landscape)
                </label>
                <label className={`flex-1 border-2 p-3 rounded-md text-center cursor-pointer transition-all ${pagesPerSheet === 4 ? 'border-[#ffe135] bg-[#ffe135] text-gray-900 font-bold' : 'border-gray-300 bg-white text-gray-600'}`}>
                  <input type="radio" name="pages" value={4} className="hidden" checked={pagesPerSheet === 4} onChange={() => setPagesPerSheet(4)} />
                  4 Pages (Portrait)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Process Button */}
        {file && (
          <button 
            onClick={handleProcess}
            disabled={isProcessing}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-bold text-lg transition-all shadow-md mt-4
              ${isProcessing ? 'bg-gray-400 text-gray-100 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg active:scale-95'}`}
          >
            {isProcessing ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> Processing & Flowing Text...</>
            ) : (
              <><Download className="w-6 h-6" /> Extract Text & Download</>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default TextExtractorTool;
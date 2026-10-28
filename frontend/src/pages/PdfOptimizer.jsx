import React, { useState, useEffect, useRef } from "react";
import { 
  FileText, 
  Settings, 
  UploadCloud, 
  X, 
  ShieldCheck, 
  Droplet, 
  Grid2X2, 
  Check, 
  Printer, 
  Sparkles, 
  Eye, 
  FileX2, 
  ExternalLink, 
  Download, 
  Loader2, 
  CheckCircle2 
} from "lucide-react";

// --- Sub-Components ---

const Navbar = ({ onToggleSettings }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#9a0002]/10 bg-[#efe6dd]/95 shadow-sm backdrop-blur-md">
      <nav className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 md:px-8" aria-label="Main navigation">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#9a0002] text-[#efe6dd] shadow-sm sm:h-11 sm:w-11">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold tracking-tight text-[#171515] sm:text-lg md:text-xl">
              PyPdf Optimizer
            </h1>
            <p className="hidden text-xs text-[#171515]/65 sm:block">
              Better notes. Fewer sheets.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleSettings}
          aria-label="Toggle PDF settings"
          title="Toggle Settings"
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#9a0002] px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#780002] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9a0002] focus-visible:ring-offset-2 focus-visible:ring-offset-[#efe6dd] active:scale-[0.98] sm:min-h-11 sm:px-5 sm:text-base"
        >
          <Settings className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          <span>Settings</span>
        </button>
      </nav>
    </header>
  );
};

const FileUploader = ({ onFileSelect, fileProp }) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (file) => {
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid PDF file.");
      onFileSelect(null);
      return;
    }

    setError("");
    onFileSelect(file);
  };

  const handleFileChange = (event) => {
    handleFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const clearFile = () => {
    onFileSelect(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <section className="mx-auto mt-5 w-full max-w-3xl px-4 sm:mt-8 sm:px-6">
      <div className="mb-4 text-center sm:mb-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#9a0002]/15 bg-[#efe6dd] px-3 py-1.5 text-xs font-semibold text-[#9a0002] sm:text-sm">
          <ShieldCheck className="h-4 w-4" />
          Made for students
        </span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#171515] sm:text-3xl md:text-4xl">
          Print more. Spend less.
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#171515]/70 sm:text-base">
          Clean up your study PDFs, improve readability, and save paper with multiple pages per sheet.
        </p>
      </div>

      <div
        onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false);
        }}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed p-5 text-center transition-colors duration-200 sm:p-8 md:p-10 ${
          isDragging
            ? "border-[#9a0002] bg-[#efe6dd]"
            : "border-[#9a0002]/25 bg-white hover:border-[#9a0002]/60 hover:bg-[#efe6dd]/40"
        }`}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#9a0002] text-white shadow-sm sm:h-16 sm:w-16">
          <UploadCloud className="h-7 w-7 sm:h-8 sm:w-8" />
        </div>
        <h3 className="mt-5 text-lg font-bold text-[#171515] sm:text-xl">
          {isDragging ? "Drop your PDF here" : "Upload your study material"}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#171515]/65">
          Drag and drop your PDF here, or choose a file from your device.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
          id="pdf-file-input"
        />
        <label
          htmlFor="pdf-file-input"
          className="mx-auto mt-5 inline-flex min-h-12 w-full max-w-xs cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#9a0002] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#780002] focus-within:ring-2 focus-within:ring-[#9a0002] focus-within:ring-offset-2 active:scale-[0.99] sm:w-auto sm:text-base"
        >
          <FileText className="h-5 w-5" />
          Choose PDF
        </label>
        <p className="mt-3 text-xs text-[#171515]/55">PDF files only</p>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
            {error}
          </p>
        )}

        {fileProp && !error && (
          <div className="mx-auto mt-5 flex w-full max-w-md items-center gap-3 rounded-xl border border-[#9a0002]/15 bg-[#efe6dd]/60 p-3 text-left sm:p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#9a0002]/10 text-[#9a0002]">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#171515]">
                {fileProp.name}
              </p>
              <p className="mt-1 text-xs text-[#171515]/60">
                PDF document · {formatSize(fileProp.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={clearFile}
              aria-label="Clear selected PDF"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#171515]/60 transition-colors hover:bg-[#9a0002]/10 hover:text-[#9a0002] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9a0002]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

const SettingsDropdown = ({ isOpen, settings, onSettingsChange }) => {
  if (!isOpen) return null;

  const toggleSetting = (settingKey) => {
    onSettingsChange({ ...settings, [settingKey]: !settings[settingKey] });
  };

  const options = [
    {
      key: "inkSaver",
      title: "Ink Saver",
      description: "Convert content to black and white to reduce color ink usage.",
      icon: Droplet,
      badge: "Save ink",
    },
    {
      key: "fourUpGrid",
      title: "4 Pages per Sheet",
      description: "Fit four PDF pages onto one printed sheet to save paper.",
      icon: Grid2X2,
      badge: "Save paper",
    },
  ];

  return (
    <section className="mx-auto mt-4 w-full max-w-3xl px-4 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-[#9a0002]/15 bg-white shadow-sm">
        <div className="border-b border-[#9a0002]/10 bg-[#efe6dd]/60 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#9a0002] text-white">
              <Printer className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-[#171515] sm:text-lg">Print Settings</h3>
              <p className="mt-0.5 text-xs leading-5 text-[#171515]/65 sm:text-sm">Customize your PDF before downloading.</p>
            </div>
            <Sparkles className="hidden h-5 w-5 shrink-0 text-[#9a0002] sm:block" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 p-3 sm:gap-4 sm:p-5 md:grid-cols-2">
          {options.map((option) => {
            const Icon = option.icon;
            const isActive = Boolean(settings?.[option.key]);

            return (
              <button
                key={option.key}
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => toggleSetting(option.key)}
                className={`flex min-h-[132px] w-full items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9a0002] focus-visible:ring-offset-2 sm:p-5 ${
                  isActive ? "border-[#9a0002] bg-[#efe6dd]/70 shadow-sm" : "border-[#171515]/10 bg-white hover:border-[#9a0002]/40 hover:bg-[#efe6dd]/30"
                }`}
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${isActive ? "bg-[#9a0002] text-white" : "bg-[#efe6dd] text-[#9a0002]"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-[#171515] sm:text-base">{option.title}</span>
                    {isActive && (
                      <span className="rounded-full bg-[#9a0002]/10 px-2 py-0.5 text-[10px] font-semibold text-[#9a0002] sm:text-xs">Active</span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-[#171515]/65 sm:text-sm sm:leading-6">{option.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#9a0002]">
                    {isActive ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Enabled
                      </>
                    ) : (
                      <>
                        <span className="h-2 w-2 rounded-full border border-[#9a0002]/50" /> {option.badge}
                      </>
                    )}
                  </span>
                </div>
                <span aria-hidden="true" className={`relative mt-1 flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${isActive ? "bg-[#9a0002]" : "bg-[#171515]/20"}`}>
                  <span className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-start gap-2 border-t border-[#9a0002]/10 px-4 py-3 sm:px-6">
          <Printer className="mt-0.5 h-4 w-4 shrink-0 text-[#9a0002]" />
          <p className="text-xs leading-5 text-[#171515]/65">
            Tip: Four pages per sheet can reduce paper usage, but very small text may be harder to read. Check your PDF preview before printing.
          </p>
        </div>
      </div>
    </section>
  );
};

const PreviewArea = ({ file }) => {
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    if (!file) {
      setFileUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <section className="mx-auto mt-5 w-full max-w-5xl px-4 pb-4 sm:mt-8 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-[#9a0002]/15 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#9a0002]/10 bg-[#efe6dd]/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#9a0002] text-white">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#171515] sm:text-lg">PDF Preview</h3>
              <p className="mt-0.5 text-xs text-[#171515]/65 sm:text-sm">
                {file ? "Review your selected document" : "Your document will appear here"}
              </p>
            </div>
          </div>
          {file && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#9a0002]/15 bg-white px-3 py-1.5 text-xs font-medium text-[#9a0002]">
              <Eye className="h-3.5 w-3.5" /> Original PDF
            </span>
          )}
        </div>

        {file && fileUrl ? (
          <>
            <div className="flex min-w-0 items-center gap-3 border-b border-[#171515]/5 px-4 py-3 sm:px-5">
              <FileText className="h-5 w-5 shrink-0 text-[#9a0002]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#171515]" title={file.name}>{file.name}</p>
                <p className="mt-0.5 text-xs text-[#171515]/60">PDF document · {formatSize(file.size)}</p>
              </div>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" aria-label="Open PDF in a new tab" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#9a0002] transition-colors hover:bg-[#efe6dd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9a0002]">
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
            <div className="bg-[#efe6dd]/50 p-2 sm:p-4">
              <div className="h-[55vh] min-h-[300px] max-h-[800px] overflow-hidden rounded-xl border border-[#171515]/10 bg-white sm:h-[65vh]">
                <iframe key={fileUrl} src={fileUrl} title={`PDF preview: ${file.name}`} className="h-full w-full border-0" />
              </div>
            </div>
          </>
        ) : (
          <div className="flex min-h-[240px] flex-col items-center justify-center px-5 py-10 text-center sm:min-h-[320px]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#efe6dd] text-[#9a0002]">
              <FileX2 className="h-8 w-8" />
            </div>
            <h4 className="mt-5 text-base font-bold text-[#171515] sm:text-lg">No PDF selected yet</h4>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[#171515]/65">Upload your study material to preview the document before processing it.</p>
          </div>
        )}
      </div>
    </section>
  );
};

const DownloadButton = ({ onProcess, isProcessing, isReady }) => {
  return (
    <section className="mx-auto mt-5 w-full max-w-3xl px-4 pb-10 sm:mt-8 sm:px-6">
      <div className="rounded-2xl border border-[#9a0002]/15 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#efe6dd] text-[#9a0002]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-[#171515] sm:text-lg">Ready to optimize?</h3>
            <p className="mt-1 text-sm leading-5 text-[#171515]/65">Process your PDF and prepare it for printing with your selected settings.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onProcess}
          disabled={isProcessing}
          aria-busy={isProcessing}
          className={`flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9a0002] focus-visible:ring-offset-2 active:scale-[0.99] sm:min-h-14 sm:text-base ${
            isProcessing ? "cursor-wait bg-[#9a0002]/65" : "bg-[#9a0002] hover:bg-[#780002] hover:shadow-md"
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
              <span>Processing your PDF...</span>
            </>
          ) : isReady ? (
            <>
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>Process & Download Again</span>
              <Download className="h-4 w-4 shrink-0" />
            </>
          ) : (
            <>
              <Download className="h-5 w-5 shrink-0" />
              <span>Process & Download PDF</span>
            </>
          )}
        </button>
        <p className="mt-3 text-center text-xs leading-5 text-[#171515]/55">Review your settings before processing to get the print layout you want.</p>
      </div>
    </section>
  );
};

// --- Main Page Component ---

const PdfOptimizerPage = () => {
  const [file, setFile] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState({
    inkSaver: true,
    fourUpGrid: true,
  });

  const BACKEND_URL = 'http://localhost:5000';

  useEffect(() => {
    fetch(`${BACKEND_URL}/ping`)
      .then(res => console.log('Backend is awake!'))
      .catch(err => console.log('Waking up backend...', err));
  }, []);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    if (selectedFile) setIsSettingsOpen(true);
  };

  const handleProcess = async () => {
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('pdfFile', file);
    formData.append('inkSaver', settings.inkSaver);
    formData.append('fourUpGrid', settings.fourUpGrid);

    try {
      const response = await fetch(`${BACKEND_URL}/api/process-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to process PDF');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Optimized_${file.name}`;
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
      console.error('Error processing file:', error);
      alert('Something went wrong while processing the PDF. Please check the backend terminal.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f3ef] flex flex-col font-sans">
      <Navbar onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)} />
      
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col items-center">
        <FileUploader onFileSelect={handleFileSelect} fileProp={file} />
        
        <SettingsDropdown 
          isOpen={isSettingsOpen} 
          settings={settings} 
          onSettingsChange={setSettings} 
        />
        
        <PreviewArea file={file} />
        
        {file && (
          <DownloadButton 
            onProcess={handleProcess} 
            isProcessing={isProcessing} 
            isReady={true} 
          />
        )}
      </main>
    </div>
  );
};

export default PdfOptimizerPage;
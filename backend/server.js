const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors());
app.use(express.json());

// Ensure temporary folders exist
const UPLOADS_DIR = path.join(__dirname, 'temp_uploads');
const OUTPUTS_DIR = path.join(__dirname, 'temp_outputs');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
if (!fs.existsSync(OUTPUTS_DIR)) fs.mkdirSync(OUTPUTS_DIR);

// Configure Multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Give file a unique name based on timestamp
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage: storage });

// 1. Wake-up Route (Frontend pings this on load)
app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'Backend is awake!' });
});

// 2. Main PDF Processing Route
app.post('/api/process-pdf', upload.single('pdfFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded.' });
  }

  const inputPdfPath = req.file.path;
  const outputPdfName = `Optimized_${req.file.filename}`;
  const outputPdfPath = path.join(OUTPUTS_DIR, outputPdfName);
  
  // Get settings from the frontend
  const inkSaver = req.body.inkSaver === 'true' ? 'True' : 'False';
  const fourUpGrid = req.body.fourUpGrid === 'true' ? 'True' : 'False';

  // Construct the command to run the Python script
  const pythonScript = path.join(__dirname, 'process_pdf.py');
  
  // Note: Depending on your Windows setup, you might need to change 'python' to 'python3' or 'py'
  const command = `python "${pythonScript}" "${inputPdfPath}" "${outputPdfPath}" "${inkSaver}" "${fourUpGrid}"`;

  console.log('Processing started for:', req.file.originalname);

  // Execute the Python script
  exec(command, (error, stdout, stderr) => {
    // 1. Log Python outputs to see the exact error
    if (stdout) console.log('Python Output:', stdout);
    if (stderr) console.error('Python Error Log:', stderr);

    if (error) {
      console.error(`Execution Error: ${error.message}`);
      if (fs.existsSync(inputPdfPath)) fs.unlinkSync(inputPdfPath);
      return res.status(500).json({ error: 'Failed to execute Python script.' });
    }

    // 2. Check if Python actually created the file before downloading
    if (!fs.existsSync(outputPdfPath)) {
      console.error("Error: Python script finished, but the output file was not created.");
      if (fs.existsSync(inputPdfPath)) fs.unlinkSync(inputPdfPath);
      return res.status(500).json({ error: 'PDF generation failed. Check backend console.' });
    }

    console.log('Processing complete. Sending file to client...');

    // Send the generated PDF back to the user
    res.download(outputPdfPath, outputPdfName, (err) => {
      if (err) console.error('Error downloading file:', err);
      
      // Clean up files
      try {
        if (fs.existsSync(inputPdfPath)) fs.unlinkSync(inputPdfPath);
        if (fs.existsSync(outputPdfPath)) fs.unlinkSync(outputPdfPath);
        console.log('Temporary files destroyed successfully.');
      } catch (cleanupError) {
        console.error('Error cleaning up files:', cleanupError);
      }
    });
  });
});

// new
// NEW ROUTE: Text Extraction & Reflow Tool
app.post('/api/extract-text', upload.single('pdfFile'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

  const inputPdfPath = req.file.path;
  const outputPdfName = `TextExtracted_${req.file.filename}`;
  const outputPdfPath = path.join(OUTPUTS_DIR, outputPdfName);
  
  const pagesPerSheet = req.body.pagesPerSheet || 4;
  const bwMode = req.body.bwMode || 'true';

  const pythonScript = path.join(__dirname, 'extract_text.py');
  const command = `python "${pythonScript}" "${inputPdfPath}" "${outputPdfPath}" "${pagesPerSheet}" "${bwMode}"`;

  exec(command, (error, stdout, stderr) => {
    if (stdout) console.log('Extract Output:', stdout);
    if (stderr) console.error('Extract Error:', stderr);

    if (error || !fs.existsSync(outputPdfPath)) {
      if (fs.existsSync(inputPdfPath)) fs.unlinkSync(inputPdfPath);
      return res.status(500).json({ error: 'Failed to extract text.' });
    }

    res.download(outputPdfPath, outputPdfName, (err) => {
      if (err) console.error('Error downloading file:', err);
      try {
        if (fs.existsSync(inputPdfPath)) fs.unlinkSync(inputPdfPath);
        if (fs.existsSync(outputPdfPath)) fs.unlinkSync(outputPdfPath);
      } catch (cleanupError) {
        console.error('Error cleaning up:', cleanupError);
      }
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
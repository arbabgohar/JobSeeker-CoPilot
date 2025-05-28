import React, { useState } from "react";
import axios from "axios";
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.js?worker';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;


const extractPdfText = async (file) => {
  const typedArray = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(' ');
    text += pageText + '\n';
  }
  return text;
};


function App() {
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [fileName, setFileName] = useState("");
  const [matchScore, setMatchScore] = useState(null);
  const [missingKeywords, setMissingKeywords] = useState([]);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setFileName(file.name);

  if (file.type === "application/pdf") {
    const text = await extractPdfText(file);
    setResume(text);
  } else if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const reader = new FileReader();
    reader.onload = async () => {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ arrayBuffer: reader.result });
      setResume(result.value);
    };
    reader.readAsArrayBuffer(file);
  } else if (file.type === "text/plain") {
    const reader = new FileReader();
    reader.onload = () => setResume(reader.result);
    reader.readAsText(file);
  } else {
    alert("Only PDF, DOCX, or TXT files are supported.");
  }
};


  const analyzeMatch = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/analyze-job", {
        job_description: jobDescription,
        resume: resume,
      });
      setMatchScore(response.data.match_score);
      setMissingKeywords(response.data.missing_keywords);
    } catch (error) {
      console.error("Error analyzing match:", error);
    }
    setLoading(false);
  };

  const generateCoverLetter = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/generate-cover-letter", {
        job_description: jobDescription,
        resume: resume,
      });
      setCoverLetter(response.data.cover_letter);
    } catch (error) {
      console.error("Error generating cover letter:", error);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">JobSeeker Copilot</h1>

      <textarea
        className="w-full p-2 border rounded mb-4"
        rows="6"
        placeholder="Paste Job Description"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Resume (PDF, DOCX, or TXT)
        </label>
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {fileName && (
          <p className="mt-2 text-sm text-gray-600">
            Selected file: {fileName}
          </p>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={analyzeMatch}
          disabled={!resume || !jobDescription}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Analyze Match
        </button>
        <button
          onClick={generateCoverLetter}
          disabled={!resume || !jobDescription}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate Cover Letter
        </button>
      </div>

      {loading && <p className="text-gray-500 mb-4">Processing...</p>}
      {matchScore !== null && (
  <div className="bg-gray-100 p-4 rounded mt-4">
    <p className="font-semibold">Match Score: <span className="text-blue-600">{matchScore}%</span></p>
    {missingKeywords.length > 0 && (
      <p className="text-sm text-red-600 mt-2">
        Missing Keywords: {missingKeywords.join(", ")}
      </p>
    )}
  </div>
 )}

{coverLetter && (
  <div className="mt-6 bg-white border p-4 rounded shadow">
    <h2 className="text-xl font-semibold mb-2">Generated Cover Letter</h2>
    <pre className="whitespace-pre-wrap text-gray-800">{coverLetter}</pre>
  </div>
)}

      {coverLetter && (
        <div className="bg-white border p-4 rounded shadow mb-4">
          <h2 className="text-xl font-semibold mb-2">Generated Cover Letter:</h2>
          <pre className="whitespace-pre-wrap text-gray-800">{coverLetter}</pre>
        </div>
      )}
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import './index.css';
import './App.css';

export default function App() {
  const [mode, setMode] = useState('candidate');
  const [role, setRole] = useState('');
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [batchResult, setBatchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleModeToggle = () => {
    setMode(prev => (prev === 'candidate' ? 'company' : 'candidate'));
    setResult(null);
    setBatchResult(null);
    setFiles([]);
    setRole('');
    setError(null);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: acceptedFiles => {
      if (acceptedFiles.length === 0) {
        setError("⚠️ Invalid file type. Please upload a PDF or DOCX.");
        return;
      }
      setFiles(acceptedFiles);
      setError(null);
    },
    multiple: mode === 'company',
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  const handleUpload = async () => {
    if (!files.length || !role.trim()) {
      setError("⚠️ Please select file(s) and enter a job role.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      if (mode === 'company') {
        files.forEach(file => formData.append("files", file));
      } else {
        formData.append("file", files[0]);
      }

      formData.append("role", role);
      formData.append("mode", mode);

      const endpoint = mode === 'company' ? 'compare-batch' : 'analyze';
      const response = await axios.post(
        `${API_BASE_URL}/api/${endpoint}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (mode === "company") {
        setBatchResult(response.data || {});
      } else {
        setResult(response.data || {});
      }
    } catch (error) {
      setError(error.response?.data?.error || "An error occurred. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1 className="title">🚀 ResumeHelp AI</h1>
      <p className="subtitle">AI-Powered Resume Analyzer & Job Match Tool</p>

      <button onClick={handleModeToggle} className="toggle-btn">
        Switch to {mode === 'candidate' ? 'Company' : 'Candidate'} Mode
      </button>

      <div className="upload-box">
        <input
          type="text"
          placeholder="Enter Role (e.g., Data Scientist)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="input-field"
        />

        <div {...getRootProps({ className: 'dropzone' })}>
          <input {...getInputProps()} />
          <p>📂 Drag & Drop resumes here, or click to browse</p>
        </div>

        {files.length > 0 && (
          <div className="file-preview">
            <strong>Selected Files:</strong>
            <ul>
              {files.map((file, idx) => (
                <li key={idx}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}

        <button onClick={handleUpload} className="upload-btn" disabled={loading}>
          {loading ? '⏳ Analyzing...' : '📄 Analyze Resume'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {/* Candidate Result Display */}
      {result && mode === 'candidate' && (
        <div className="result-box">
          <h2 className="result-title">📊 Analysis Result</h2>
          <p className={`role-badge ${result.success ? 'success' : 'fail'}`}>
            Candidate Result
          </p>

          {/* Strong Points */}
          {result.strongPoints && result.strongPoints.length > 0 && (
            <div className="section-box">
              <h3 className="section-title">Strong Points</h3>
              <ul>
                {result.strongPoints.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Weak Points */}
          {result.weakPoints && result.weakPoints.length > 0 && (
            <div className="section-box">
              <h3 className="section-title">Weak Points</h3>
              <ul>
                {result.weakPoints.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvement Suggestions */}
          {result.improvementSuggestions && result.improvementSuggestions.length > 0 && (
            <div className="section-box">
              <h3 className="section-title">Improvement Suggestions</h3>
              <ul>
                {result.improvementSuggestions.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Company Batch Result Display */}
      {batchResult && mode === 'company' && (
        <div className="result-box">
          <h2 className="result-title">Batch Comparison Results</h2>
          <div className="section-box">
            <h3 className="section-title">Best Resume</h3>
            <p>{batchResult.bestResume?.name}</p>
            <h3 className="section-title">Ranked Candidates</h3>
            <ul>
              {batchResult?.rankedCandidates?.map((candidate, idx) => (
                <li key={idx}>{candidate.name}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

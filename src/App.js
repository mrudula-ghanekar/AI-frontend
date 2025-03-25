import React, { useState } from 'react';
import axios from 'axios';
import './index.css';
import './App.css';

export default function App() {
  const [mode, setMode] = useState('candidate');
  const [role, setRole] = useState('');
  const [files, setFiles] = useState([]);
  const [batchResult, setBatchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleModeToggle = () => {
    setMode(prev => (prev === 'candidate' ? 'company' : 'candidate'));
    setBatchResult(null);
    setFiles([]);
    setRole('');
    setError(null);
  };

  const handleFileChange = (e) => {
    const selectedFiles = mode === 'company' ? Array.from(e.target.files) : [e.target.files[0]];
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (!files.length || !role) {
      setError("⚠️ Please select file(s) and enter a job role.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append("files", file));
      formData.append("role", role);

      const response = await axios.post(
        `${API_BASE_URL}/api/compare-batch`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setBatchResult(response.data || {});
    } catch (error) {
      setError(error.response?.data?.error || "An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1 className="title">🚀 ResumeHelp AI</h1>

      <button onClick={handleModeToggle} className="toggle-btn">
        Switch to {mode === 'candidate' ? 'Company' : 'Candidate'} Mode
      </button>

      <div className="upload-box">
        <input type="text" placeholder="Enter Role (e.g., Data Scientist)" value={role} onChange={(e) => setRole(e.target.value)} className="input-field" />
        <input type="file" multiple={mode === 'company'} onChange={handleFileChange} className="input-field" />
        <button onClick={handleUpload} className="upload-btn">{loading ? '⏳ Analyzing...' : '📄 Analyze Resume'}</button>
      </div>

      {batchResult && <BatchResultDisplay batchResult={batchResult} />}
    </div>
  );
}

// ✅ Company Mode Batch Result Display - Candidate Name & File Name in Summary
const BatchResultDisplay = ({ batchResult }) => (
  <div className="result-box">
    <h2 className="result-title">🏆 Batch Comparison Result</h2>
    <ul className="ranking-list">
      {batchResult?.ranking?.map((item, idx) => (
        <li key={idx}>
          <strong>🏅 Rank {idx + 1} (Score: {item.score}%)</strong><br />
          📄 {item.candidate_name} ({item.file_name})<br />
          {item.summary}
        </li>
      ))}
    </ul>
  </div>
);

import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

  const handleFileChange = (e) => {
    const selectedFiles = mode === 'company' ? Array.from(e.target.files) : [e.target.files[0]];
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (!files.length || !role) {
      setError("⚠️ Please provide both file(s) and role.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      if (mode === "company") {
        files.forEach(file => formData.append("files", file)); // ✅ Use "files" for Company Mode
      } else {
        formData.append("file", files[0]); // ✅ Use "file" for Candidate Mode
      }

      formData.append("role", role);
      formData.append("mode", mode);

      console.log("📡 Sending Form Data:", [...formData.entries()]);

      const response = await axios.post(`${API_BASE_URL}/api/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      console.log("✅ API Response:", response.data);
      if (mode === "company") {
        setBatchResult(response.data || {});
      } else {
        setResult(response.data || {});
      }
    } catch (error) {
      console.error("❌ Upload Error:", error.response ? error.response.data : error.message);
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
        <input 
          type="file" 
          multiple={mode === 'company'} 
          onChange={handleFileChange} 
          className="input-field" 
        />
        <button onClick={handleUpload} className="upload-btn">
          {loading ? '⏳ Analyzing...' : '📄 Analyze Resume'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}
      {result && <ResultDisplay mode={mode} result={result} />}
      {batchResult && <BatchResultDisplay batchResult={batchResult} />}
    </div>
  );
}

const ResultDisplay = ({ mode, result }) => (
  <div className="result-box">
    <h2 className="result-title">📊 Analysis Result</h2>
    <p className={`role-badge ${result?.suited_for_role === 'Yes' ? 'success' : 'fail'}`}>
      {result?.suited_for_role === 'Yes' ? '✅ Suitable' : '❌ Not Suitable'}
    </p>
    <Section title="💪 Strong Points" data={result?.strong_points || []} />
    <Section title="⚠️ Weak Points" data={result?.weak_points || []} />
    <Section title="💡 Improvement Suggestions" data={result?.improvement_suggestions || []} />
    {mode === 'company' && result?.comparison_score && (
      <Section title="📊 Comparison Score" data={[result.comparison_score]} />
    )}
  </div>
);

const BatchResultDisplay = ({ batchResult }) => (
  <div className="result-box">
    <h2 className="result-title">🏆 Batch Comparison Result</h2>
    <h3 className="best-resume">Best Resume: {batchResult?.best_resume_summary || 'N/A'}</h3>
    <ul className="ranking-list">
      {batchResult?.ranking?.map((item, idx) => (
        <li key={idx} className="ranking-item">
          <strong>🏅 Rank {item.index + 1} (Score: {item.score}%)</strong>: {item.summary}
        </li>
      )) || <li>No ranking data available.</li>}
    </ul>
  </div>
);

const Section = ({ title, data }) => (
  <div className="section-box">
    <h3 className="section-title">{title}</h3>
    <ul>
      {data.length > 0 ? data.map((point, idx) => <li key={idx}>✅ {point}</li>) : <li>❌ No data available.</li>}
    </ul>
  </div>
);

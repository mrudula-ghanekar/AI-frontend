import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import './index.css';
import './App.css';
import './LandingPage';

export default function App() {
  const [mode, setMode] = useState('candidate');
  const [role, setRole] = useState('');
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [batchResult, setBatchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // 🔄 Toggle Candidate/Company Mode
  const handleModeToggle = () => {
    setMode(prev => (prev === 'candidate' ? 'company' : 'candidate'));
    setResult(null);
    setBatchResult(null);
    setFiles([]);
    setRole('');
    setError(null);
  };

  // 📂 Drag and Drop File Selection
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: acceptedFiles => setFiles(acceptedFiles),
    multiple: mode === 'company',
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  // 🚀 Upload & Analyze Resume(s)
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

        {/* Drag & Drop File Upload */}
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
    <div className="ranking-container">
      {batchResult?.ranking?.length > 0 ? (
        batchResult.ranking.map((item, idx) => (
          <div key={idx} className="ranking-card">
            <h4 className="rank-title">🏅 Rank {idx + 1}</h4>
            <p className="score">Score: <strong>{item.score}%</strong></p>
            <p className="summary">{item.candidate_name || item.file_name} - {item.summary}</p>
          </div>
        ))
      ) : (
        <p>No ranking data available.</p>
      )}
    </div>
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

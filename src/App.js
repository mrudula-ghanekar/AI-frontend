import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [jdFile, setJdFile] = useState(null);
  const [resumeFiles, setResumeFiles] = useState([]);
  const [role, setRole] = useState('');
  const [result, setResult] = useState(null);
  const [batchResult, setBatchResult] = useState(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('individual');

  const handleJDChange = (e) => {
    setJdFile(e.target.files[0]);
  };

  const handleResumeChange = (e) => {
    setResumeFiles(Array.from(e.target.files));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setResumeFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleAnalyze = async () => {
    setError('');
    setResult(null);
    setBatchResult(null);

    if (!jdFile || resumeFiles.length === 0 || !role) {
      setError('Please upload a job description, resume(s), and enter a role.');
      return;
    }

    const formData = new FormData();
    formData.append('jd', jdFile);
    resumeFiles.forEach((file, index) => {
      formData.append('resumes', file);
    });
    formData.append('role', role);
    formData.append('mode', mode);

    try {
      const response = await axios.post('http://localhost:5000/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (mode === 'company') {
        let data = response.data;

        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) {
            setError('⚠️ Failed to parse server response.');
            return;
          }
        }

        if (Array.isArray(data) && data.length > 0) {
          setBatchResult(data);
        } else {
          setError('⚠️ No valid results returned for the company mode.');
        }
      } else {
        setResult(response.data);
      }
    } catch (err) {
      setError('An error occurred during analysis.');
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Resume Matcher</h1>
        <p className="app-subtitle">Match resumes against a job description</p>
      </header>

      <div className="app-controls">
        <div>
          <label className="btn-secondary">Upload JD:
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleJDChange} hidden />
          </label>
        </div>

        <div
          className="dropzone-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          Drag & drop resume(s) here or click to upload
          <input type="file" multiple accept=".pdf,.doc,.docx" onChange={handleResumeChange} hidden />
        </div>

        <div className="file-list">
          {resumeFiles.map((file, index) => (
            <div className="file-item" key={index}>{file.name}</div>
          ))}
        </div>

        <input
          className="input-role"
          type="text"
          placeholder="Enter Role (e.g., Data Scientist)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />

        <div>
          <label>
            <input
              type="radio"
              name="mode"
              value="individual"
              checked={mode === 'individual'}
              onChange={(e) => setMode(e.target.value)}
            /> Individual
          </label>
          <label style={{ marginLeft: '1rem' }}>
            <input
              type="radio"
              name="mode"
              value="company"
              checked={mode === 'company'}
              onChange={(e) => setMode(e.target.value)}
            /> Company
          </label>
        </div>

        <button className="btn-primary" onClick={handleAnalyze}>Analyze Resume</button>

        {error && <div className="error-banner">{error}</div>}
      </div>

      {result && (
        <div className="results-panel">
          <h2>Match Result</h2>
          <div className="result-section">
            <h3>Candidate: {result.candidate_name}</h3>
            <p><strong>Score:</strong> {result.score}</p>
            <p><strong>Summary:</strong> {result.summary}</p>
          </div>
        </div>
      )}

      {batchResult && (
        <div className="results-panel">
          <h2>Batch Results</h2>
          {batchResult.map((r, i) => (
            <div key={i} className="result-section">
              <h3>{r.candidate_name}</h3>
              <p><strong>File:</strong> {r.file_name}</p>
              <p><strong>Score:</strong> {r.score}</p>
              <p><strong>Summary:</strong> {r.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [jobDescription, setJobDescription] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [mode, setMode] = useState('candidate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [batchResult, setBatchResult] = useState([]);

  const handleJDUpload = (e) => {
    setJobDescription(e.target.files[0]);
  };

  const handleResumeUpload = (e) => {
    setResumes(Array.from(e.target.files));
  };

  const handleAnalyze = async () => {
    if (!jobDescription || resumes.length === 0) {
      setError('Please upload both JD and at least one resume.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setBatchResult([]);

    const formData = new FormData();
    formData.append('jd', jobDescription);
    resumes.forEach((resume) => formData.append('resumes', resume));

    try {
      const response = await axios.post(
        mode === 'candidate' ? '/analyze-candidate' : '/analyze-company',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (mode === 'candidate') {
        setResult(response.data);
      } else if (Array.isArray(response.data)) {
        setBatchResult(response.data);
      } else {
        setError('⚠️ No valid results returned for company mode.');
      }
    } catch (err) {
      setError('Something went wrong while processing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>Resume Matcher</h1>
        <p className="app-subtitle">Match resumes with job descriptions</p>
      </div>

      <div className="app-controls">
        <div>
          <button
            className="btn-secondary"
            onClick={() => setMode('candidate')}
            style={{ marginRight: '0.5rem', background: mode === 'candidate' ? '#d9e0ff' : '' }}
          >
            Candidate Mode
          </button>
          <button
            className="btn-secondary"
            onClick={() => setMode('company')}
            style={{ background: mode === 'company' ? '#d9e0ff' : '' }}
          >
            Company Mode
          </button>
        </div>

        <input type="file" accept=".pdf" onChange={handleJDUpload} />
        <div className="dropzone-area">
          <input type="file" multiple accept=".pdf" onChange={handleResumeUpload} />
          <p>Drag & drop resume(s) here or click to upload</p>
        </div>

        {resumes.length > 0 && (
          <div className="file-list">
            {resumes.map((file, i) => (
              <div key={i} className="file-item">{file.name}</div>
            ))}
          </div>
        )}

        <button className="btn-primary" onClick={handleAnalyze} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </button>

        {error && <div className="error-banner">{error}</div>}
      </div>

      {result && mode === 'candidate' && (
        <div className="results-panel">
          <h2>Analysis Result</h2>
          <div className="badge badge-success">Match Score: {result.score}%</div>
          <div className="result-section">
            <h3>Summary</h3>
            <p>{result.summary}</p>
          </div>
        </div>
      )}

      {batchResult.length > 0 && mode === 'company' && (
        <div className="results-panel">
          <h2>Batch Results</h2>
          {batchResult.map((res, idx) => (
            <div key={idx} className="result-section">
              <h3>{res.candidate_name}</h3>
              <div className={`badge ${res.score >= 70 ? 'badge-success' : 'badge-fail'}`}>
                Match Score: {res.score}%
              </div>
              <p><strong>File:</strong> {res.file_name}</p>
              <p>{res.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;

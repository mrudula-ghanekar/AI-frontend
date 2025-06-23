import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import './App.css';

export default function App() {
  const [mode, setMode] = useState('candidate');
  const [role, setRole] = useState('');
  const [files, setFiles] = useState([]);
  const [jdFile, setJdFile] = useState(null);
  const [result, setResult] = useState(null);
  const [batchResult, setBatchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleModeToggle = () => {
    setMode(prev => (prev === 'candidate' ? 'company' : 'candidate'));
    setRole('');
    setFiles([]);
    setJdFile(null);
    setResult(null);
    setBatchResult(null);
    setError(null);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: acceptedFiles => {
      if (!acceptedFiles.length) {
        setError("⚠️ Please upload a valid resume (PDF/DOCX).");
        return;
      }
      if (mode === 'company' && acceptedFiles.length > 10) {
        setError("⚠️ You can upload a maximum of 10 resumes in company mode.");
        return;
      }
      setFiles(acceptedFiles);
      setError(null);
    },
    multiple: mode === 'company',
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    }
  });

  const { getRootProps: getJDRootProps, getInputProps: getJDInputProps } = useDropzone({
    onDrop: acceptedFiles => {
      if (acceptedFiles.length !== 1) {
        setError("⚠️ Please upload exactly one job description.");
        return;
      }
      setJdFile(acceptedFiles[0]);
      setError(null);
    },
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    }
  });

  const handleUpload = async () => {
    if (!role.trim() || !files.length || (mode === 'company' && !jdFile)) {
      setError("⚠️ Please fill all required fields and upload file(s).");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setBatchResult(null);

    try {
      const formData = new FormData();

      if (mode === 'company') {
        files.forEach(file => formData.append('files', file));
        formData.append('jd_file', jdFile);
      } else {
        formData.append('file', files[0]);
      }

      formData.append('role', role);
      formData.append('mode', mode);

      const response = await axios.post(`${API_BASE_URL}/api/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = response.data;

      if (mode === 'company') {
        if (Array.isArray(data)) {
          setBatchResult(data);
        } else {
          setError("⚠️ Invalid batch result format from API.");
        }
      } else {
        if (!data || !data.status) {
          setError("⚠️ Invalid candidate response from server.");
          return;
        }
        setResult({
          suitableForRole: data.suited_for_role === 'Yes',
          strongPoints: data.strong_points || [],
          weakPoints: data.weak_points || [],
          recommendations: data.recommendations || null
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
      if (err.response?.data?.error) {
        setError(`⚠️ ${err.response.data.error}`);
      } else {
        setError("⚠️ Something went wrong. Please try again.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>ResumeHelp AI</h1>
        <p className="app-subtitle">AI-Powered Resume Analyzer & Job Match</p>
      </header>

      <div className="app-controls">
        <button onClick={handleModeToggle} className="btn-secondary">
          Switch to {mode === 'candidate' ? 'Company' : 'Candidate'} Mode
        </button>

        <input
          type="text"
          placeholder="Enter Job Role (e.g. Backend Developer)"
          className="input-role"
          value={role}
          onChange={e => setRole(e.target.value)}
        />

        {mode === 'company' && (
          <div {...getJDRootProps({ className: 'dropzone-area' })}>
            <input {...getJDInputProps()} />
            <p>Upload Job Description File</p>
            {jdFile && <div className="file-item">{jdFile.name}</div>}
          </div>
        )}

        <div {...getRootProps({ className: 'dropzone-area' })}>
          <input {...getInputProps()} />
          <p>Drag & drop resume{mode === 'company' ? 's' : ''} here, or click to select</p>
        </div>

        {files.length > 0 && (
          <div className="file-list">
            {files.map((file, idx) => (
              <div key={idx} className="file-item">{file.name}</div>
            ))}
          </div>
        )}

        <button onClick={handleUpload} className="btn-primary" disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </button>

        {error && <div className="error-banner">{error}</div>}
      </div>

      {result && (
        <div className="results-panel">
          <h2>Candidate Report</h2>
          <div className={`badge ${result.suitableForRole ? 'badge-success' : 'badge-fail'}`}>
            {result.suitableForRole ? 'Suitable for Role' : 'Not Suitable for Role'}
          </div>

          <section>
            <h3>Strong Points</h3>
            {result.strongPoints.length > 0 ? (
              <ul>{result.strongPoints.map((pt, i) => <li key={i}>{pt}</li>)}</ul>
            ) : <p>None identified.</p>}
          </section>

          <section>
            <h3>Areas for Improvement</h3>
            {result.weakPoints.length > 0 ? (
              <ul>{result.weakPoints.map((pt, i) => <li key={i}>{pt}</li>)}</ul>
            ) : <p>No specific weaknesses noted.</p>}
          </section>

          <section>
            <h3>Recommendations</h3>
            {result.recommendations ? (
              <>
                <p><strong>Courses:</strong> {result.recommendations.online_courses.join(', ')}</p>
                <p><strong>YouTube:</strong> {result.recommendations.youtube_channels.join(', ')}</p>
                <p><strong>Guides:</strong> {result.recommendations.career_guides.join(', ')}</p>
                <p><strong>Alt Roles:</strong> {result.recommendations.alternative_roles.join(', ')}</p>
                <p><strong>Skills to Learn:</strong> {result.recommendations.skills_to_learn.join(', ')}</p>
              </>
            ) : <p>No recommendations available.</p>}
          </section>
        </div>
      )}

      {batchResult && (
        <div className="results-panel">
          <h2>Batch Evaluation</h2>
          {batchResult.map((entry, index) => (
            <div key={index} className="result-section">
              <h3>{entry.candidate_name || 'Unnamed'} ({entry.score}%)</h3>
              <p><strong>Resume:</strong> {entry.file_name}</p>
              <p><strong>Summary:</strong> {entry.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

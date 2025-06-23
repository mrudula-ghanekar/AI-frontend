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
    setResult(null);
    setBatchResult(null);
    setFiles([]);
    setJdFile(null);
    setRole('');
    setError(null);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: acceptedFiles => {
      if (acceptedFiles.length === 0) {
        setError("⚠️ Invalid file type. Please upload a PDF or DOCX.");
        return;
      }
      if (mode === 'company' && acceptedFiles.length > 10) {
        setError("⚠️ You can upload up to 10 resumes in company mode.");
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
        setError("⚠️ Please upload exactly one job description file.");
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
    if (!files.length || !role.trim() || (mode === 'company' && !jdFile)) {
      setError("⚠️ Please select file(s), a job description, and enter a job role.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setBatchResult(null);

    try {
      const formData = new FormData();
      if (mode === 'company') {
        files.forEach(file => formData.append("files", file));
        formData.append("jd_file", jdFile);
      } else {
        formData.append("file", files[0]);
      }

      formData.append("role", role);
      formData.append("mode", mode);

      const response = await axios.post(
        `${API_BASE_URL}/api/analyze`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const data = response.data;

      if (mode === 'company') {
        if (Array.isArray(data)) {
          setBatchResult(data);
        } else if (data && Array.isArray(data.ranking)) {
          setBatchResult(data.ranking);
        } else {
          setError("⚠️ No valid results returned for company mode.");
        }
      } else {
        if (
          data &&
          data.status === 'success' &&
          typeof data.suited_for_role === 'string' &&
          Array.isArray(data.strong_points) &&
          Array.isArray(data.weak_points)
        ) {
          setResult({
            suitableForRole: data.suited_for_role === "Yes",
            strongPoints: data.strong_points || [],
            weakPoints: data.weak_points || [],
            recommendations: data.recommendations || null
          });
        } else {
          setError("⚠️ Invalid candidate response from server.");
        }
      }
    } catch (error) {
      if (error.response) {
        setError(`⚠️ ${error.response?.data?.error || 'An unexpected error occurred.'}`);
      } else if (error.request) {
        setError('⚠️ Network error. Please check your connection.');
      } else {
        setError('⚠️ Something went wrong. Please try again.');
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
          placeholder="Enter Role (e.g., Data Scientist)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="input-role"
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
          <p>Drag & drop resume(s) here or click to upload</p>
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
          <h2>Candidate Analysis</h2>
          <div className={`badge ${result.suitableForRole ? 'badge-success' : 'badge-fail'}`}>
            {result.suitableForRole ? 'Suitable for the role' : 'Not suitable for the role'}
          </div>

          <section>
            <h3>Strong Points</h3>
            {result.strongPoints.length ? (
              <ul>{result.strongPoints.map((pt, i) => <li key={i}>{pt}</li>)}</ul>
            ) : <p>No strong points identified.</p>}
          </section>

          <section>
            <h3>Areas for Improvement</h3>
            {result.weakPoints.length ? (
              <ul>{result.weakPoints.map((pt, i) => <li key={i}>{pt}</li>)}</ul>
            ) : <p>No areas for improvement noted.</p>}
          </section>

          {result.recommendations && (
            <section>
              <h3>Suggestions</h3>
              <p><strong>Courses:</strong> {result.recommendations.online_courses.join(', ')}</p>
              <p><strong>YouTube Channels:</strong> {result.recommendations.youtube_channels.join(', ')}</p>
              <p><strong>Career Guides:</strong> {result.recommendations.career_guides.join(', ')}</p>
              <p><strong>Alt. Roles:</strong> {result.recommendations.alternative_roles.join(', ')}</p>
              <p><strong>Skills:</strong> {result.recommendations.skills_to_learn.join(', ')}</p>
            </section>
          )}
        </div>
      )}

      {batchResult && (
        <div className="results-panel">
          <h2>Company Mode Results</h2>
          {batchResult.map((entry, index) => (
            <div key={index} className="result-section">
              <h3>{entry.candidate_name} ({entry.score}%)</h3>
              <p><strong>Resume:</strong> {entry.file_name}</p>
              <p><strong>Summary:</strong> {entry.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

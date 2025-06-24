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

  const removeFile = (fileName) => {
    setFiles(prevFiles => prevFiles.filter(f => f.name !== fileName));
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: acceptedFiles => {
      if (acceptedFiles.length === 0) {
        setError("⚠️ Invalid file type. Please upload a PDF or DOCX.");
        return;
      }
      if (mode === 'company' && files.length + acceptedFiles.length > 10) {
        setError("⚠️ You can upload up to 10 resumes in company mode.");
        return;
      }
      const uniqueNewFiles = acceptedFiles.filter(
        newFile => !files.some(existing => existing.name === newFile.name)
      );
      setFiles(prev => [...prev, ...uniqueNewFiles]);
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
      setError("⚠️ Please select file(s), a job description (if in company mode), and enter a job role.");
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

      formData.append("role", role.trim());
      formData.append("mode", mode);

      const response = await axios.post(`${API_BASE_URL}/api/analyze-file`, formData);
      const data = response.data;

      if (mode === 'company') {
        let ranking = [];

        if (Array.isArray(data)) {
          ranking = data;
        } else if (Array.isArray(data.ranking)) {
          ranking = data.ranking;
        } else if (data && data.file_name) {
          ranking = [data];
        }

        if (ranking.length > 0) {
          setBatchResult(ranking);
        } else {
          setError("⚠️ Invalid company response from server.");
        }
      } else {
        const rec = data.recommendations || {};
        const processedResult = {
          candidateName: data.candidate_name || 'Unnamed Candidate',
          suitableForRole: data.suited_for_role === 'Yes',
          strongPoints: Array.isArray(data.strong_points) ? data.strong_points : [],
          weakPoints: Array.isArray(data.weak_points) ? data.weak_points : [],
          recommendations: {
            online_courses: rec.online_courses || [],
            youtube_channels: rec.youtube_channels || [],
            career_guides: rec.career_guides || [],
            alternative_roles: rec.alternative_roles || [],
            skills_to_learn: rec.skills_to_learn || [],
          }
        };

        setResult(processedResult);
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error.response) {
        const raw = error.response?.data?.error;
        const clean = typeof raw === 'string' ? raw.replace(/[\n\r]/g, ' ') : 'An unexpected error occurred.';
        setError(`⚠️ ${clean}`);
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
              <div key={idx} className="file-item">
                <span>{file.name}</span>
                <button
                  className="file-item-close"
                  onClick={() => removeFile(file.name)}
                  title="Remove file"
                  aria-label="Remove file"
                />
              </div>
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
            <ul>{result.strongPoints.map((pt, i) => <li key={i}>{pt}</li>)}</ul>
          </section>

          <section>
            <h3>Areas for Improvement</h3>
            <ul>{result.weakPoints.map((pt, i) => <li key={i}>{pt}</li>)}</ul>
          </section>

          {!result.suitableForRole && (
            <section>
              <h3>Suggestions</h3>
              <p><strong>Courses:</strong> {result.recommendations.online_courses.join(', ') || 'N/A'}</p>
              <p><strong>YouTube Channels:</strong> {result.recommendations.youtube_channels.join(', ') || 'N/A'}</p>
              <p><strong>Career Guides:</strong> {result.recommendations.career_guides.join(', ') || 'N/A'}</p>
              <p><strong>Alt. Roles:</strong> {result.recommendations.alternative_roles.join(', ') || 'N/A'}</p>
              <p><strong>Skills to Learn:</strong> {result.recommendations.skills_to_learn.join(', ') || 'N/A'}</p>
            </section>
          )}
        </div>
      )}

      {batchResult && (
        <div className="results-panel">
          <h2>Company Mode Results</h2>
          {batchResult.map((entry, index) => (
            <div key={index} className="result-section">
              <h3>{entry.candidate_name || entry.file_name || 'Unnamed'} ({entry.score || 0}%)</h3>
              <p><strong>Resume:</strong> {entry.file_name}</p>
              <p><strong>Summary:</strong> {entry.summary}</p>

              {entry.improvement_suggestions && entry.improvement_suggestions.length > 0 && (
                <div>
                  <h4>Improvement Suggestions</h4>
                  <ul>
                    {entry.improvement_suggestions.map((sugg, idx) => (
                      <li key={idx}>{sugg}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import './App.css';

export default function App() {
  const [mode, setMode] = useState('candidate');
  const [role, setRole] = useState('');
  const [files, setFiles] = useState([]);
  const [jdFile, setJdFile] = useState(null); // 🔹 JD file state
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
    setJdFile(null); // 🔹 Reset JD file
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

  // 🔹 JD file dropzone (single file)
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

    try {
      const formData = new FormData();
      if (mode === 'company') {
        files.forEach(file => formData.append("files", file));
        formData.append("jd_file", jdFile); // 🔹 Append JD file
      } else {
        formData.append("file", files[0]);
      }

      formData.append("role", role);
      formData.append("mode", mode);

      const endpoint = mode === 'company' ? 'compare-batch' : 'analyze';

      const response = await axios.post(
        `${API_BASE_URL}/api/${endpoint}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          }
        }
      );

      if (mode === 'company') {
        response.data ? setBatchResult(response.data) : setError('⚠️ No results returned for the company mode.');
      } else {
        if (response.data) {
          setResult({
            suitableForRole: response.data.suited_for_role === "Yes",
            strongPoints: response.data.strong_points || [],
            weakPoints: response.data.weak_points || [],
            improvementSuggestions: response.data.improvement_suggestions || [],
          });
        } else {
          setError('⚠️ No results returned for the candidate mode.');
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

        {/* 🔹 Show JD upload only in company mode */}
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

      {/* Existing Candidate & Company Result sections remain unchanged */}
      {/* ... */}
    </div>
  );
}

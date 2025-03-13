import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [mode, setMode] = useState('candidate'); // candidate or company
  const [role, setRole] = useState('');
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Update your actual backend URL here
  const API_BASE = "https://ai-backend-mg.up.railway.app";

  // Toggle between Candidate and Company Mode
  const toggleMode = () => {
    setMode(prevMode => prevMode === 'candidate' ? 'company' : 'candidate');
    setResult(null); // Clear previous result
    setFiles([]); // Clear files
  };

  // Handle file input
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  // Handle role input
  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  // ✅ Handle Candidate Single Resume Analysis
  const analyzeResume = async () => {
    if (files.length === 0 || role.trim() === '') {
      alert("Please select a resume and enter a role.");
      return;
    }

    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('role', role);

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/api/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      alert("Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Company Batch Resume Comparison
  const compareBatch = async () => {
    if (files.length === 0 || role.trim() === '') {
      alert("Please upload resumes and enter a role.");
      return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('role', role);

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/api/batchAnalyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (error) {
      console.error("Error during batch comparison:", error);
      alert("Failed to compare resumes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setFiles([]);
    setRole('');
    setResult(null);
  };

  return (
    <div className="App">
      <h1>🚀 ResumeHelp AI</h1>
      <p>AI-Powered Resume Analyzer & Job Match Tool</p>

      <button onClick={toggleMode}>
        {mode === 'candidate' ? 'Switch to Company Mode' : 'Switch to Candidate Mode'}
      </button>

      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          value={role}
          onChange={handleRoleChange}
          placeholder="Enter Job Role (e.g., Data Scientist)"
          style={{ padding: '10px', width: '300px' }}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <input
          type="file"
          onChange={handleFileChange}
          multiple={mode === 'company'}
          style={{ padding: '10px' }}
        />
        <p>{files.length} file(s) selected</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        {mode === 'candidate' ? (
          <button onClick={analyzeResume} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze Resume'}
          </button>
        ) : (
          <button onClick={compareBatch} disabled={loading}>
            {loading ? 'Comparing...' : 'Compare Batch'}
          </button>
        )}
        <button onClick={resetAll} style={{ marginLeft: '10px' }}>
          Reset
        </button>
      </div>

      {result && (
        <div style={{ marginTop: '30px', textAlign: 'left', width: '80%', margin: '30px auto' }}>
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;

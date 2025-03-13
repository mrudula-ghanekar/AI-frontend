import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Make sure this import is present and file is correct

const API_BASE_URL = 'https://ai-backend-mg.up.railway.app';

function App() {
  const [mode, setMode] = useState('candidate');
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobRole, setJobRole] = useState('');
  const [response, setResponse] = useState('');

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setResponse(''); // Clear previous response when switching modes
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleAnalyzeResume = async () => {
    if (!selectedFile) {
      alert('Please upload a resume file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('jobRole', jobRole);

    try {
      let endpoint = mode === 'candidate' ? '/api/analyzeResume' : '/api/batchResponse';
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResponse(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Error:', error);
      if (error.response) {
        setResponse(`Error: ${error.response.status} - ${error.response.data.error}`);
      } else {
        setResponse('An error occurred while processing the request.');
      }
    }
  };

  return (
    <div className="App">
      <h1>ResumeHelp AI</h1>
      <div className="mode-toggle">
        <button onClick={() => handleModeChange('candidate')} className={mode === 'candidate' ? 'active' : ''}>
          Candidate Mode
        </button>
        <button onClick={() => handleModeChange('company')} className={mode === 'company' ? 'active' : ''}>
          Company Mode
        </button>
      </div>
      <div className="upload-section">
        <label>Select Resume </label>
        <input type="file" onChange={handleFileChange} />
      </div>
      <div className="input-section">
        <label>Enter Job Role </label>
        <input
          type="text"
          value={jobRole}
          onChange={(e) => setJobRole(e.target.value)}
          placeholder="e.g., Software Engineer"
        />
      </div>
      <button className="analyze-btn" onClick={handleAnalyzeResume}>Analyze Resume</button>
      {response && (
        <div className="response-section">
          <h2>Analysis Result:</h2>
          <pre>{response}</pre>
        </div>
      )}
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'https://ai-backend-mg.up.railway.app';

function App() {
  const [mode, setMode] = useState('candidate');
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobRole, setJobRole] = useState('');
  const [response, setResponse] = useState('');

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setResponse('');
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setJobRole('');
    setResponse('');
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
      const res = await axios.post(`${API_BASE_URL}${endpoint}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResponse(JSON.stringify(res.data, null, 2));
    } catch (error) {
      console.error('Error:', error);
      setResponse(
        error.response
          ? `Error: ${error.response.status} - ${error.response.data.error}`
          : 'An error occurred while processing the request.'
      );
    }
  };

  return (
    <div className="App">
      <h1>
        <img src="https://cdn-icons-png.flaticon.com/512/747/747376.png" alt="Rocket" width="35" />
        ResumeHelp AI
      </h1>
      <h4>AI-Powered Resume Analyzer & Job Match Tool</h4>

      <button className="switch-btn" onClick={() => handleModeChange(mode === 'candidate' ? 'company' : 'candidate')}>
        Switch to {mode === 'candidate' ? 'Company' : 'Candidate'} Mode
      </button>

      <input
        type="text"
        placeholder="Job Role (e.g., Software Engineer)"
        value={jobRole}
        onChange={(e) => setJobRole(e.target.value)}
      />

      <label htmlFor="file-upload" className="file-label">
        {selectedFile ? selectedFile.name : 'Choose File'}
      </label>
      <input id="file-upload" type="file" onChange={handleFileChange} />

      <div style={{ marginTop: '20px' }}>
        <button onClick={handleAnalyzeResume}>Analyze Resume</button>
        <button className="reset-btn" onClick={handleReset}>Reset</button>
      </div>

      {response && (
        <div className="response-box">
          <h2>Analysis Result:</h2>
          <pre>{response}</pre>
        </div>
      )}
    </div>
  );
}

export default App;

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
      setResponse(error.response ? `Error: ${error.response.status} - ${error.response.data.error}` : 'An error occurred while processing the request.');
    }
  };

  return (
    <div className="App">
      <h1>ResumeHelp AI</h1>

      <div className="mode-toggle">
        <button className={mode === 'candidate' ? 'active' : ''} onClick={() => handleModeChange('candidate')}>Candidate Mode</button>
        <button className={mode === 'company' ? 'active' : ''} onClick={() => handleModeChange('company')}>Company Mode</button>
      </div>

      <div className="upload-box">
        <label htmlFor="file-upload" className="custom-file-upload">
          {selectedFile ? selectedFile.name : 'Click or Drag & Drop to upload Resume'}
        </label>
        <input id="file-upload" type="file" onChange={handleFileChange} />
      </div>

      <input
        type="text"
        placeholder="Enter Job Role (e.g., Software Engineer)"
        value={jobRole}
        onChange={(e) => setJobRole(e.target.value)}
        className="job-role-input"
      />

      <button onClick={handleAnalyzeResume} className="analyze-btn">Analyze Resume</button>

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

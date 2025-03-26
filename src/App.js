import React, { useState } from 'react';
import ResumeAnalyzer from './ResumeAnalyzer';  // Adjust the path as needed
import './App.css';  // Include any CSS for styling

function App() {
  const [mode, setMode] = useState('candidate');  // Default mode can be 'candidate' or 'company'

  // Toggle mode between Candidate and Company
  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'candidate' ? 'company' : 'candidate'));
  };

  return (
    <div className="App">
      <h1>Resume Analyzer</h1>
      <div>
        <button onClick={toggleMode}>
          Switch to {mode === 'candidate' ? 'Company' : 'Candidate'} Mode
        </button>
      </div>

      {/* Render ResumeAnalyzer with the selected mode */}
      <ResumeAnalyzer mode={mode} />
    </div>
  );
}

export default App;

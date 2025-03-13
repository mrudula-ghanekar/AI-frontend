import React, { useState } from 'react';
import axios from 'axios';
import './index.css';
import './App.css';
import BatchCompare from './BatchCompare';

export default function App() {
  const [mode, setMode] = useState('candidate');
  const [role, setRole] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [batchResult, setBatchResult] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  console.log("API Base URL:", API_BASE_URL); // Check if ENV is working

  const handleModeToggle = () => {
    setMode(prev => (prev === 'candidate' ? 'company' : 'candidate'));
    setResult(null);
    setBatchResult(null);
    setFile(null);
    setRole('');
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('role', role);
      formData.append('mode', mode);
      console.log("Sending request to:", `${API_BASE_URL}/api/analyze`);

      const response = await axios.post(`${API_BASE_URL}/api/analyze`, formData);
      console.log("Response:", response.data);
      setResult(response.data);
    } catch (error) {
      console.error("Error during resume analysis:", error);
      handleError(error);
    }
  };

  const handleBatchCompare = async () => {
    try {
      const formData = new FormData();
      file.forEach(f => formData.append('files', f));
      formData.append('role', role);
      console.log("Sending request to:", `${API_BASE_URL}/api/batchResponse`);

      const response = await axios.post(`${API_BASE_URL}/api/batchResponse`, formData);
      console.log("Batch Response:", response.data);
      setBatchResult(response.data);
    } catch (error) {
      console.error("Error during batch comparison:", error);
      handleError(error);
    }
  };

  const handleError = (error) => {
    if (error.response) {
      console.error("API responded with error:", error.response.data);
      alert(`Error: ${error.response.data.message || 'Server Error'}`);
    } else if (error.request) {
      console.error("No response from API:", error.request);
      alert("No response from server. Please try again later.");
    } else {
      console.error("Request error:", error.message);
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 flex flex-col items-center py-10 px-6">
      <h1 className="text-5xl font-extrabold text-gray-800 mb-4">🚀 ResumeHelp AI</h1>
      <p className="text-lg text-gray-700 mb-8 text-center">AI-Powered Resume Analyzer & Job Match Tool</p>

      {/* Mode Switch */}
      <button
        onClick={handleModeToggle}
        className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition mb-6"
      >
        Switch to {mode === 'candidate' ? 'Company' : 'Candidate'} Mode
      </button>

      {/* Upload Section */}
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-3xl space-y-6">
        <input
          type="text"
          placeholder="Enter Role (e.g., Data Scientist)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-400 outline-none"
        />
        <input
          type="file"
          onChange={(e) => setFile(mode === 'candidate' ? e.target.files[0] : Array.from(e.target.files))}
          multiple={mode === 'company'}
          className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-400 outline-none"
        />

        <div className="flex gap-4">
          <button
            onClick={mode === 'candidate' ? handleUpload : handleBatchCompare}
            className="bg-green-500 text-white px-6 py-3 rounded-lg w-full hover:bg-green-600 transition"
          >
            {mode === 'candidate' ? 'Analyze Resume' : 'Compare Batch'}
          </button>
          <button
            onClick={() => { setFile(null); setRole(''); setResult(null); setBatchResult(null); }}
            className="bg-red-500 text-white px-6 py-3 rounded-lg w-full hover:bg-red-600 transition"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Candidate Mode Result */}
      {result && (
        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-4xl mt-10 space-y-6">
          <h2 className="text-3xl font-bold text-gray-800">📊 Analysis Result</h2>
          <p className="text-lg"><strong>Suited for Role:</strong> {result.suited_for_role === 'Yes' ? '✅ Yes' : '❌ No'}</p>

          <Section title="💪 Strong Points" data={result.strong_points} />
          {mode === 'candidate' && <Section title="⚠️ Weak Points" data={result.weak_points} />}
          {mode === 'candidate' && <Section title="💡 Improvement Suggestions" data={result.improvement_suggestions} />}
          {mode === 'company' && result.comparison_score && (
            <div>
              <h3 className="font-semibold text-lg">📊 Comparison Score</h3>
              <p>{result.comparison_score}</p>
            </div>
          )}
        </div>
      )}

      {/* Company Mode Batch Result */}
      {batchResult && (
        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-4xl mt-10 space-y-6">
          <h2 className="text-3xl font-bold text-gray-800">🏆 Batch Comparison Result</h2>
          <p className="text-lg"><strong>Best Resume Summary:</strong> {batchResult.best_resume_summary}</p>
          <h3 className="font-semibold mt-4 text-lg">Rankings:</h3>
          <ul className="list-decimal pl-6 space-y-2">
            {batchResult.ranking.map((item, idx) => (
              <li key={idx} className="text-gray-700">
                <strong>Rank {item.index + 1} (Score: {item.score}%)</strong>: {item.summary}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Reusable Section Component
const Section = ({ title, data }) => (
  <div>
    <h3 className="font-semibold text-lg">{title}</h3>
    <ul className="list-disc pl-6 space-y-1">
      {data && data.length > 0 ? (
        data.map((point, idx) => (
          <li key={idx} className="text-gray-700">{point}</li>
        ))
      ) : (
        <li className="text-gray-500">No data available.</li>
      )}
    </ul>
  </div>
);
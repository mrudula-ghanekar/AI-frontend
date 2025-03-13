import React, { useState } from 'react';
import axios from 'axios';
import './index.css';
import style from './App.css';
import Home from './Home';


export default function App() {
  const [mode, setMode] = useState('candidate');
  const [role, setRole] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [batchResult, setBatchResult] = useState(null);

  const handleModeToggle = () => {
    setMode(prev => (prev === 'candidate' ? 'company' : 'candidate'));
    setResult(null);
    setBatchResult(null);
    setFile(null);
    setRole('');
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('role', role);
    formData.append('mode', mode);
    const response = await axios.post('https://resumehelp-backend-production.up.railway.app/api/analyze', formData);
    setResult((res.data));
  };

  const handleBatchCompare = async () => {
    const formData = new FormData();
    file.forEach(f => formData.append('files', f));
    formData.append('role', role);
    const batchResponse = await axios.post('https://resumehelp-backend-production.up.railway.app/api/compare-batch', formData);
    setBatchResult((res.data));
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

      {/* Result Display */}
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

      {/* Batch Result */}
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

const Section = ({ title, data }) => (
  <div>
    <h3 className="font-semibold text-lg">{title}</h3>
    <ul className="list-disc pl-6 space-y-1">
      {data.map((point, idx) => (
        <li key={idx} className="text-gray-700">{point}</li>
      ))}
    </ul>
  </div>
);

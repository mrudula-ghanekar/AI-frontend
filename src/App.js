import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [mode, setMode] = useState('candidate');
  const [file, setFile] = useState(null);
  const [role, setRole] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [batchResult, setBatchResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('role', role);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/response`, formData);
      console.log('Response from server:', res.data);
      setResponse(res.data);
      setError('');
    } catch (err) {
      console.error('Error from server:', err);
      setError(err.response?.data?.error || 'An error occurred while processing the resume.');
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchCompare = async () => {
    setLoading(true);
    const formData = new FormData();
    file.forEach(f => formData.append('files', f));
    formData.append('role', role);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/batchAnalyze`, formData); // ✅ Correct endpoint
      console.log('Batch Response from server:', res.data);
      setBatchResult(res.data); // ✅ Assume array response
      setError('');
    } catch (err) {
      console.error('Batch Error from server:', err);
      setError(err.response?.data?.error || 'An error occurred during batch comparison.');
      setBatchResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">ResumeHelp</h1>
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-3xl">
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => { setMode('candidate'); setResponse(null); setBatchResult(null); }}
            className={`px-4 py-2 rounded-lg ${mode === 'candidate' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Candidate Mode
          </button>
          <button
            onClick={() => { setMode('company'); setResponse(null); setBatchResult(null); }}
            className={`px-4 py-2 rounded-lg ${mode === 'company' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Company Mode
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Upload {mode === 'candidate' ? 'Resume' : 'Resumes'}</label>
            <input
              type="file"
              onChange={(e) => setFile(mode === 'candidate' ? e.target.files[0] : Array.from(e.target.files))}
              multiple={mode === 'company'}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Job Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Frontend Developer"
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          {mode === 'candidate' && (
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-lg">
              {loading ? 'Analyzing...' : 'Analyze Resume'}
            </button>
          )}
        </form>
        {mode === 'company' && (
          <button
            onClick={handleBatchCompare}
            className="w-full bg-green-500 text-white p-2 rounded-lg mt-4"
          >
            {loading ? 'Comparing...' : 'Compare Resumes'}
          </button>
        )}
      </div>

      {error && <div className="text-red-500 mt-4">{error}</div>}

      {response && (
        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-4xl mt-10 space-y-6">
          <h2 className="text-3xl font-bold text-gray-800">AI-Powered Analysis Result</h2>
          <p><strong>Match Score:</strong> {response.match_score}%</p>
          <p><strong>Grammar Score:</strong> {response.grammar_score}%</p>
          <p><strong>Formatting Score:</strong> {response.formatting_score}%</p>
          <h3 className="font-semibold mt-4">Strong Points:</h3>
          <ul className="list-disc pl-6">
            {response.strong_points.map((point, idx) => <li key={idx}>{point}</li>)}
          </ul>
          <h3 className="font-semibold mt-4">Improvement Suggestions:</h3>
          <ul className="list-disc pl-6">
            {response.improvement_suggestions.map((suggestion, idx) => <li key={idx}>{suggestion}</li>)}
          </ul>
          <h3 className="font-semibold mt-4">AI-Improved Resume:</h3>
          <textarea
            value={response.improved_resume}
            readOnly
            rows="10"
            className="w-full p-4 border border-gray-300 rounded-lg"
          />
        </div>
      )}

      {batchResult && batchResult.length > 0 && (
        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-4xl mt-10 space-y-6">
          <h2 className="text-3xl font-bold text-gray-800">🏆 Batch Comparison Result</h2>
          <h3 className="font-semibold mt-4 text-lg">Rankings:</h3>
          <ul className="list-decimal pl-6 space-y-2">
            {batchResult.map((item, idx) => (
              <li key={idx} className="text-gray-700">
                <strong>{item.fileName}</strong><br />
                <strong>Score:</strong> {item.comparison_score}%<br />
                <strong>Strengths:</strong>
                <ul className="list-disc pl-6">
                  {item.strong_points.map((point, pidx) => (
                    <li key={pidx}>{point}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;

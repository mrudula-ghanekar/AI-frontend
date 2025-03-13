import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://ai-backend-mg.up.railway.app';
console.log('API Base URL:', API_BASE_URL);

function App() {
  const [mode, setMode] = useState('candidate');
  const [file, setFile] = useState(null);
  const [role, setRole] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [batchResult, setBatchResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files.length > 1 ? Array.from(e.target.files) : e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('role', role);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/analyze`, formData);
      console.log('API Response:', res.data);
      setResult(res.data);
      setError('');
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.error || 'An error occurred while processing your request.');
      setResult(null);
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
      setBatchResult(res.data);
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">ResumeHelp AI</h1>
        <div className="flex justify-center space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded ${mode === 'candidate' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => { setMode('candidate'); setResult(null); setBatchResult(null); setError(''); }}
          >
            Candidate Mode
          </button>
          <button
            className={`px-4 py-2 rounded ${mode === 'company' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
            onClick={() => { setMode('company'); setResult(null); setBatchResult(null); setError(''); }}
          >
            Company Mode
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Select {mode === 'candidate' ? 'Resume' : 'Resumes (multiple allowed)'}</label>
            <input
              type="file"
              onChange={handleFileChange}
              multiple={mode === 'company'}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Enter Job Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="e.g., Software Engineer"
            />
          </div>
          {mode === 'candidate' ? (
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded"
            >
              {loading ? 'Analyzing...' : 'Analyze Resume'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleBatchCompare}
              disabled={loading}
              className="w-full bg-green-500 text-white py-2 rounded"
            >
              {loading ? 'Comparing...' : 'Compare Resumes'}
            </button>
          )}
        </form>
        {error && <div className="mt-4 text-red-500">{error}</div>}
        {result && mode === 'candidate' && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Analysis Result</h2>
            <div className="bg-gray-50 p-4 rounded shadow">
              <h3 className="font-semibold">Skills Match:</h3>
              <p>{result.skillsMatch}</p>
              <h3 className="font-semibold mt-2">Formatting Suggestions:</h3>
              <p>{result.formattingSuggestions}</p>
              <h3 className="font-semibold mt-2">Grammar Check:</h3>
              <p>{result.grammarCheck}</p>
              <h3 className="font-semibold mt-2">Improvements:</h3>
              <p>{result.improvements}</p>
              <h3 className="font-semibold mt-2">Download Improved Resume:</h3>
              <a
                href={`data:application/pdf;base64,${result.improvedResume}`}
                download="Improved_Resume.pdf"
                className="text-blue-500 underline"
              >
                Download PDF
              </a>
            </div>
          </div>
        )}
        {batchResult && mode === 'company' && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Batch Comparison Result</h2>
            {batchResult.map((item, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded shadow mb-4">
                <h3 className="font-semibold">Candidate {index + 1}:</h3>
                <p><strong>Skills Match:</strong> {item.skillsMatch}</p>
                <p><strong>Formatting:</strong> {item.formatting}</p>
                <p><strong>Grammar:</strong> {item.grammar}</p>
                <p><strong>Overall Score:</strong> {item.overallScore}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

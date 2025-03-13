import React, { useState } from 'react';

const Home = () => {
  const [mode, setMode] = useState('candidate');
  const [role, setRole] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [batchResult, setBatchResult] = useState(null);

  const handleModeToggle = () => setMode(mode === 'candidate' ? 'company' : 'candidate');

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Title Section */}
      <h1 className="text-5xl font-bold text-center mb-4">
        ResumeHelp <span className="text-indigo-600">AI</span>
      </h1>
      <p className="text-lg text-gray-600 text-center max-w-2xl mb-8">
        AI-Powered Resume Analyzer & Job Match Tool. Get actionable insights to stand out in your career!
      </p>

      {/* Mode Switch */}
      <button
        onClick={handleModeToggle}
        className={`px-6 py-3 rounded-full text-white shadow-lg mb-8 ${
          mode === 'candidate' ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-pink-500 hover:bg-pink-600'
        }`}
      >
        Switch to {mode === 'candidate' ? 'Company' : 'Candidate'} Mode
      </button>

      {/* Upload & Role Input */}
      <div className="bg-white p-8 rounded-3xl shadow-xl space-y-6 w-full max-w-2xl">
        <input
          type="text"
          placeholder="Enter Role (e.g., Data Scientist)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-4 border rounded-xl placeholder-gray-400"
        />
        <label className="flex items-center justify-center p-6 border-2 border-dashed rounded-xl text-gray-500 cursor-pointer hover:border-indigo-400">
          Upload {mode === 'candidate' ? 'Resume' : 'Multiple Resumes'}
          <input type="file" onChange={(e) => setFile(mode === 'candidate' ? e.target.files[0] : Array.from(e.target.files))} multiple={mode === 'company'} className="hidden" />
        </label>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => console.log('Analyze')} // Replace with actual logic
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full"
          >
            {mode === 'candidate' ? 'Analyze Resume' : 'Compare Resumes'}
          </button>
          <button
            onClick={() => { setFile(null); setRole(''); setResult(null); setBatchResult(null); }}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {result && (
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-4xl mt-10 space-y-8">
          <h2 className="text-3xl font-bold">Analysis Result</h2>
          <p>
            <span className="font-semibold">Suited for Role: </span>
            <span className={`inline-block px-3 py-1 rounded-full text-white ${result.suited_for_role === 'Yes' ? 'bg-green-500' : 'bg-red-500'}`}>
              {result.suited_for_role === 'Yes' ? '✅ Yes' : '❌ No'}
            </span>
          </p>
          <div>
            <h3 className="text-xl font-semibold">💪 Strong Points</h3>
            <ul className="list-disc ml-5">{result.strong_points.map((pt, idx) => <li key={idx}>{pt}</li>)}</ul>
          </div>
        </div>
      )}

      {/* Batch Comparison */}
      {batchResult && (
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-4xl mt-10">
          <h2 className="text-3xl font-bold">🏆 Best Resume Summary</h2>
          <p className="text-lg mt-2">{batchResult.best_resume_summary}</p>
          <h3 className="text-2xl font-semibold mt-4">Rankings:</h3>
          {batchResult.ranking.map((item, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-xl shadow flex justify-between items-center my-2">
              <div>
                <h4 className="font-semibold">Rank #{item.index + 1}</h4>
                <p>{item.summary}</p>
              </div>
              <span className="bg-indigo-500 text-white px-3 py-1 rounded-full">{item.score}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;

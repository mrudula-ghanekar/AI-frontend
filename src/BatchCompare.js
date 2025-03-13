import React, { useState } from 'react';
import axios from 'axios';

export default function BatchCompare() {
  const [files, setFiles] = useState([]);
  const [role, setRole] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Correct Backend API Endpoint
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  const handleUpload = async () => {
    if (files.length === 0 || role.trim() === '') {
      alert("Please upload resumes and enter a job role.");
      return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('role', role);

    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/batchAnalyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResults(res.data);
    } catch (error) {
      console.error("Error analyzing batch:", error);
      alert("Failed to analyze batch resumes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📊 Batch Resume Comparison</h2>
      
      <input 
        type="file" 
        multiple 
        onChange={(e) => setFiles(Array.from(e.target.files))} 
        className="border p-2 mb-4 w-full" 
      />
      
      <input 
        type="text" 
        value={role} 
        onChange={(e) => setRole(e.target.value)} 
        placeholder="Job Role" 
        className="border p-2 mb-4 w-full" 
      />
      
      <button 
        onClick={handleUpload} 
        className="bg-blue-600 text-white p-2 rounded"
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Analyze Batch"}
      </button>

      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold">Top Ranked Candidates:</h3>
          {results.map((res, idx) => (
            <div key={idx} className="border p-4 mt-4 rounded">
              <h4 className="font-bold">{res.fileName}</h4>
              <p><strong>Comparison Score:</strong> {res.comparison_score}</p>
              <ul>
                {res.strong_points.map((p, i) => <li key={i}>✅ {p}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

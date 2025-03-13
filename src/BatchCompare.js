import React, { useState } from 'react';
import axios from 'axios';

export default function BatchCompare() {
  const [files, setFiles] = useState([]);
  const [role, setRole] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('role', role);

    setLoading(true);
    const res = await axios.post('http://localhost:8080/api/batch-analyze', formData);
    setResults(res.data);
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📊 Batch Resume Comparison</h2>
      <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files))} className="border p-2 mb-4 w-full" />
      <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Job Role" className="border p-2 mb-4 w-full" />
      <button onClick={handleUpload} className="bg-blue-600 text-white p-2 rounded">Analyze Batch</button>

      {loading && <p>Analyzing resumes...</p>}

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

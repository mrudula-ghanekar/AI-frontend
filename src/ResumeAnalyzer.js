import React, { useState } from 'react';
import axios from 'axios';

// Component to display the result after uploading the resume
const ResultDisplay = ({ mode, result }) => (
  <div className="result-box">
    <h2 className="result-title">📊 Analysis Result</h2>
    <p className={`role-badge ${result.success ? 'success' : 'fail'}`}>
      {mode === 'candidate' ? 'Candidate Result' : 'Company Result'}
    </p>

    {mode === 'candidate' ? (
      <>
        <div className="section-box">
          <h3 className="section-title">Strong Points</h3>
          {result?.strongPoints && result.strongPoints.length > 0 ? (
            <ul>
              {result.strongPoints.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          ) : (
            <p>No strong points found.</p>
          )}
        </div>

        <div className="section-box">
          <h3 className="section-title">Weak Points</h3>
          {result?.weakPoints && result.weakPoints.length > 0 ? (
            <ul>
              {result.weakPoints.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          ) : (
            <p>No weak points found.</p>
          )}
        </div>

        <div className="section-box">
          <h3 className="section-title">Improvement Suggestions</h3>
          {result?.improvementSuggestions && result.improvementSuggestions.length > 0 ? (
            <ul>
              {result.improvementSuggestions.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          ) : (
            <p>No improvement suggestions found.</p>
          )}
        </div>
      </>
    ) : (
      <div className="section-box">
        <h3 className="section-title">Best Resume</h3>
        <p>{result.bestResume?.name}</p>
        <h3 className="section-title">Ranked Candidates</h3>
        <ul>
          {result?.rankedCandidates?.map((candidate, idx) => (
            <li key={idx}>{candidate.name}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

// Component to handle file upload and analyze the resume
const ResumeAnalyzer = ({ mode }) => {
  const [files, setFiles] = useState([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState({});
  const [batchResult, setBatchResult] = useState({});

  const API_BASE_URL = "https://ai-backend-mg.up.railway.app"; // Replace with your actual API URL

  // Handle file selection
  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  // Handle role input
  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  // Upload files and analyze resume
  const handleUpload = async () => {
    if (!files.length || !role.trim()) {
      setError("⚠️ Please select file(s) and enter a job role.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      if (mode === 'company') {
        // Append multiple files if it's in company mode
        files.forEach(file => formData.append("files", file));
      } else {
        formData.append("file", files[0]);
      }

      formData.append("role", role);
      formData.append("mode", mode);

      const endpoint = mode === 'company' ? 'compare-batch' : 'analyze';
      const response = await axios.post(
        `${API_BASE_URL}/api/${endpoint}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Debugging: Log the response
      console.log('Backend Response:', response.data);

      if (mode === "company") {
        setBatchResult(response.data || {});
      } else {
        setResult(response.data || {});
      }
    } catch (error) {
      setError(error.response?.data?.error || "An error occurred. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>AI-Powered Resume Analyzer</h1>
      {error && <div className="error">{error}</div>}

      <div className="file-upload">
        <input type="file" multiple={mode === 'company'} onChange={handleFileChange} />
      </div>

      <div className="role-input">
        <input
          type="text"
          placeholder="Enter job role"
          value={role}
          onChange={handleRoleChange}
        />
      </div>

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Analyzing..." : "Upload & Analyze"}
      </button>

      {/* Display results based on the mode */}
      {mode === 'candidate' ? (
        <ResultDisplay mode={mode} result={result} />
      ) : (
        <ResultDisplay mode={mode} result={batchResult} />
      )}
    </div>
  );
};

export default ResumeAnalyzer;

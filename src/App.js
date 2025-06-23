import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import './App.css';

function App() {
  const [mode, setMode] = useState('candidate');
  const [role, setRole] = useState('');
  const [files, setFiles] = useState([]);
  const [jdFile, setJdFile] = useState(null);
  const [result, setResult] = useState(null);
  const [batchResult, setBatchResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const base = process.env.REACT_APP_API_BASE_URL;

  const drop = useDropzone({
    onDrop: f => setFiles(f),
    multiple: mode === 'company',
    accept: { 'application/pdf': [], 'application/msword': [], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [] }
  });

  const jdDrop = useDropzone({
    onDrop: f => setJdFile(f[0]),
    multiple: false,
    accept: drop.accept
  });

  const upload = async () => {
    if (!role || files.length === 0 || (mode==='company' && !jdFile)) {
      setError('Please fill all fields and upload necessary file(s).');
      return;
    }
    setError(''); setLoading(true); setResult(null); setBatchResult(null);

    const fd = new FormData();
    fd.append('mode', mode);
    fd.append('role', role);
    if (mode === 'company') {
      files.forEach(f => fd.append('files', f));
      fd.append('jd_file', jdFile);
    } else {
      fd.append('file', files[0]);
    }

    try {
      const { data } = await axios.post(`${base}/api/analyze-file`, fd);
      if (mode === 'candidate') setResult(data);
      else setBatchResult(Array.isArray(data) ? data : data.ranking);
    } catch (e) {
      setError(e.response?.data?.error || 'Server error');
    }
    setLoading(false);
  };

  return (
    <div>
      <button onClick={() => { setMode(m => m==='candidate'?'company':'candidate'); setResult(null); setError(''); }}>Switch to {mode==='candidate'?'Company':'Candidate'}</button>
      <br/>
      Role:<input value={role} onChange={e=>setRole(e.target.value)}/><br/>
      {mode==='company' && <div {...jdDrop.getRootProps()} style={{border:'1px solid black'}}>JD: <input {...jdDrop.getInputProps()} />{jdFile?.name}</div>}
      <div {...drop.getRootProps()} style={{border:'1px solid blue', margin:'5px'}}>Upload resume(s):<input {...drop.getInputProps()} />{files.map(f=>f.name).join(',')}</div>
      <button onClick={upload} disabled={loading}>{loading?'Loading...':'Analyze'}</button>
      <div style={{color:'red'}}>{error}</div>

      {mode==='candidate' && result && (
        <div>
          <h2>Candidate Result</h2>
          <p>Status: {result.status}</p>
          <p>Fit: {result.suited_for_role}</p>
          <h3>Strong</h3><ul>{result.strong_points?.map((s,i)=><li key={i}>{s}</li>)}</ul>
          <h3>Weak</h3><ul>{result.weak_points?.map((w,i)=><li key={i}>{w}</li>)}</ul>
          <h3>Recommendations</h3>
          {Object.entries(result.recommendations || {}).map(([k,v])=>
            <p key={k}><strong>{k}:</strong> {(v||[]).join(', ')}</p>
          )}
        </div>
      )}

      {mode==='company' && batchResult && (
        <div>
          <h2>Company Ranking</h2>
          {batchResult.map((e,i)=>(
            <div key={i}>
              <h3>{i+1}. {e.candidate_name} — {e.score}%</h3>
              <p>{e.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;

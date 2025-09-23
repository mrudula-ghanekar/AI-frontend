import React, { useState } from "react";

function App() {
  const [mode, setMode] = useState("candidate");
  const [role, setRole] = useState("");
  const [files, setFiles] = useState([]); // for resumes
  const [jdFile, setJdFile] = useState(null);
  const [result, setResult] = useState(null);

  const uploadFile = async () => {
    if (files.length === 0 || !role) {
      alert("please upload file(s) and enter role");
      return;
    }
    if (mode === "company" && !jdFile) {
      alert("please upload job description file");
      return;
    }

    let formData = new FormData();
    if (mode === "candidate") {
      formData.append("file", files[0]);
    } else {
      files.forEach((f) => formData.append("files", f));
      formData.append("jd_file", jdFile);
    }
    formData.append("role", role);
    formData.append("mode", mode);

    try {
      let res = await fetch("http://localhost:8080/api/analyze-file", {
        method: "POST",
        body: formData,
      });
      let data = await res.json();
      setResult(data);
    } catch (e) {
      alert("error uploading file");
    }
  };

  return (
    <div>
      <h1>Resume Help AI</h1>
      <button onClick={() => setMode(mode === "candidate" ? "company" : "candidate")}>
        switch to {mode === "candidate" ? "company" : "candidate"}
      </button>
      <br />
      <input
        type="text"
        placeholder="enter role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />
      <br />

      {mode === "company" && (
        <div>
          <p>upload JD file</p>
          <input type="file" onChange={(e) => setJdFile(e.target.files[0])} />
        </div>
      )}

      <p>{mode === "candidate" ? "upload 1 resume" : "upload multiple resumes"}</p>
      <input
        type="file"
        multiple={mode === "company"}
        onChange={(e) => setFiles(Array.from(e.target.files))}
      />
      <br />

      <button onClick={uploadFile}>analyze</button>

      {files.length > 0 && (
        <div>
          <h3>Files:</h3>
          <ul>
            {files.map((f, i) => (
              <li key={i}>{f.name}</li>
            ))}
          </ul>
        </div>
      )}

      {result && (
        <div>
          <h2>Result</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;

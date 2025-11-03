import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import {
  Upload,
  Briefcase,
  UserCircle2,
  FileText,
  Loader2,
  AlertTriangle,
  Copy,
  Download,
  CheckCircle,
  XCircle,
} from "lucide-react";
import "./App.css";

export default function App() {
  const [mode, setMode] = useState("candidate");
  const [role, setRole] = useState("");
  const [resumes, setResumes] = useState([]);
  const [jdFile, setJdFile] = useState(null);
  const [result, setResult] = useState(null);
  const [batchResult, setBatchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [assistantMessage, setAssistantMessage] = useState(
    "What job role are you aiming for?"
  );

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  /* 🎙 Voice System */
  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    const cleanText = text.replace(/[^\w\s.,!?'"-]/g, "");
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.rate = 1.05;
    utter.pitch = 1.1;
    utter.volume = 1;
    const voices = speechSynthesis.getVoices();
    utter.voice =
      voices.find((v) => v.name.includes("Google") || v.lang.startsWith("en")) ||
      voices[0];
    speechSynthesis.speak(utter);
  };

  useEffect(() => {
    speak(assistantMessage);
  }, [assistantMessage]);

  /* 🌐 Mode Switch */
  const toggleMode = () => {
    setMode((m) => (m === "candidate" ? "company" : "candidate"));
    setResumes([]);
    setJdFile(null);
    setResult(null);
    setBatchResult(null);
    setRole("");
    setError("");
    setAssistantMessage(
      "You’ve switched modes. Let’s start fresh — what role are you hiring or applying for?"
    );
  };

  /* 🧾 Resume Upload */
  const removeResume = (name) =>
    setResumes((prev) => prev.filter((f) => f.name !== name));

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (accepted) => {
      const maxFiles = mode === "company" ? 10 : 1;
      if (resumes.length + accepted.length > maxFiles) {
        setError(`You can upload up to ${maxFiles} resume${maxFiles > 1 ? "s" : ""}.`);
        setAssistantMessage(
          `You can upload up to ${maxFiles} resume${maxFiles > 1 ? "s" : ""}.`
        );
        return;
      }
      const newFiles = accepted.filter(
        (f) => !resumes.some((r) => r.name === f.name)
      );
      setResumes((prev) => [...prev, ...newFiles]);
      setError("");
      setAssistantMessage("Got it! Your resume is uploaded. Looking sharp!.  Click on the analyze button" );
    },
    multiple: mode === "company",
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
      ],
    },
  });

  /* 📜 JD Upload */
  const { getRootProps: getJDProps, getInputProps: getJDInput } = useDropzone({
    onDrop: (accepted) => {
      if (accepted.length !== 1) {
        setError("Please upload only one JD file.");
        setAssistantMessage("Hmm, please upload only one job description file.");
        return;
      }
      setJdFile(accepted[0]);
      setError("");
      setAssistantMessage("Awesome! JD uploaded. Now upload your resume next.");
    },
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
      ],
    },
  });

  /* 🔍 Analyze */
  const analyze = async () => {
    if (!role.trim() || resumes.length === 0 || !jdFile) {
      setError("Please upload both JD and resume, and enter your target role.");
      setAssistantMessage("I need all three — role, JD, and resume — before analyzing.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setBatchResult(null);
    setAssistantMessage("Analyzing your data now. This should only take a few moments...");

    try {
      const formData = new FormData();

      if (mode === "company") {
        resumes.forEach((r) => formData.append("files", r));
        formData.append("jd_file", jdFile);
      } else {
        formData.append("file", resumes[0]);
        formData.append("jd_file", jdFile);
      }

      formData.append("role", role);
      formData.append("mode", mode);

      const res = await axios.post(`${API_BASE_URL}/analyze-file`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res.data;

      if (mode === "company" && Array.isArray(data.ranked_resumes)) {
        setBatchResult({
          ranked: data.ranked_resumes,
          topFits: data.top_fits || [],
        });
        setAssistantMessage("All done! Here are the ranked resumes by suitability.");
      } else {
        // Build the candidate result object expecting backend fields:
        // candidate_name, suited_for_role, strong_points, weak_points, improvement_suggestions, recommendations
        setResult({
          name: data.candidate_name || "Unnamed Candidate",
          suitable: (data.suited_for_role || "").toString().toLowerCase() === "yes",
          strengths: Array.isArray(data.strong_points) ? data.strong_points : (data.strong_points ? [data.strong_points] : []),
          weaknesses: Array.isArray(data.weak_points) ? data.weak_points : (data.weak_points ? [data.weak_points] : []),
          improvement_suggestions: Array.isArray(data.improvement_suggestions) ? data.improvement_suggestions : (data.improvement_suggestions ? [data.improvement_suggestions] : []),
          recommendations: data.recommendations || {} // expect object with online_courses, youtube_channels, career_guides, alternative_roles, skills_to_learn
        });
        setAssistantMessage("Here’s your detailed analysis — scroll down for detailed suggestions.");
      }
    } catch (err) {
      console.error(err);
      setError("Network or server error. Please try again.");
      setAssistantMessage("Hmm, something went wrong while analyzing. Let's try again.");
    } finally {
      setLoading(false);
    }
  };

  /* utility: format result as readable text for copy/download */
  const formatCandidateText = (r) => {
    if (!r) return "";
    const rec = r.recommendations || {};
    return [
      `Candidate Analysis — ${r.name}`,
      `Role: ${role}`,
      `Suitable: ${r.suitable ? "Yes" : "No"}`,
      "",
      "Strong Points:",
      ...(r.strengths && r.strengths.length ? r.strengths.map((s) => `- ${s}`) : ["- None provided"]),
      "",
      "Areas for Improvement:",
      ...(r.weaknesses && r.weaknesses.length ? r.weaknesses.map((w) => `- ${w}`) : ["- None provided"]),
      "",
      "Improvement Suggestions:",
      ...(r.improvement_suggestions && r.improvement_suggestions.length ? r.improvement_suggestions.map((i) => `- ${i}`) : ["- None provided"]),
      "",
      "Recommendations:",
      "Online Courses:",
      ...(rec.online_courses && rec.online_courses.length ? rec.online_courses.map((c) => `- ${c}`) : ["- None provided"]),
      "",
      "YouTube Channels:",
      ...(rec.youtube_channels && rec.youtube_channels.length ? rec.youtube_channels.map((y) => `- ${y}`) : ["- None provided"]),
      "",
      "Career Guides:",
      ...(rec.career_guides && rec.career_guides.length ? rec.career_guides.map((g) => `- ${g}`) : ["- None provided"]),
      "",
      "Alternative Roles:",
      ...(rec.alternative_roles && rec.alternative_roles.length ? rec.alternative_roles.map((a) => `- ${a}`) : ["- None provided"]),
      "",
      "Skills to Learn:",
      ...(rec.skills_to_learn && rec.skills_to_learn.length ? rec.skills_to_learn.map((s) => `- ${s}`) : ["- None provided"]),
    ].join("\n");
  };

  const copyAnalysis = async () => {
    const text = formatCandidateText(result);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setAssistantMessage("Analysis copied to clipboard.");
    } catch {
      setAssistantMessage("Unable to copy automatically. Use right-click to copy.");
    }
  };

  const downloadAnalysisTxt = () => {
    const text = formatCandidateText(result);
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.name.replace(/\s+/g, "_")}_analysis.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setAssistantMessage("Downloaded analysis as text file.");
  };

  /* Step Helper */
  const getCurrentStep = () => {
    if (!role.trim()) return "role";
    if (!jdFile) return "jd";
    if (resumes.length === 0) return "resume";
    return "analyze";
  };

  const step = getCurrentStep();

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-left">
          <FileText className="logo-icon" />
          <h1 className="brand">
            ResumeHelp<span>AI</span>
          </h1>
        </div>
        <div className="nav-right">
          <button className="mode-btn" onClick={toggleMode}>
            {mode === "candidate" ? <Briefcase size={18} /> : <UserCircle2 size={18} />}
            Switch to {mode === "candidate" ? "Company" : "Candidate"} Mode
          </button>
        </div>
      </nav>

      <motion.main
        className="main-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* ROLE INPUT */}
        <div className={`input-card ${step === "role" ? "highlight" : ""}`}>
          <label>Target Role</label>
          <input
            type="text"
            placeholder="e.g. Data Scientist, Product Manager"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>

        {/* JD DROPZONE */}
        <div {...getJDProps({ className: `dropzone ${step === "jd" ? "highlight" : ""}` })}>
          <input {...getJDInput()} />
          <p>{jdFile ? jdFile.name : "Upload Job Description (JD) File"}</p>
        </div>

        {/* RESUME DROPZONE */}
        <div {...getRootProps({ className: `dropzone ${step === "resume" ? "highlight" : ""}` })}>
          <input {...getInputProps()} />
          <p>
            <Upload size={18} />
            {mode === "candidate"
              ? " Drag & drop your resume or click to upload"
              : " Upload up to 10 resumes for ranking"}
          </p>
        </div>

        {/* UPLOADED FILE LIST */}
        {resumes.length > 0 && (
          <div className="file-list">
            {resumes.map((file) => (
              <div key={file.name} className="file-item">
                <span>{file.name}</span>
                <button onClick={() => removeResume(file.name)} className="remove-btn">
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <motion.div className="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AlertTriangle size={16} /> {error}
          </motion.div>
        )}

        {/* ANALYZE BUTTON */}
        <motion.button
          className={`btn-analyze ${loading ? "disabled" : ""} ${step === "analyze" ? "highlight" : ""}`}
          onClick={analyze}
          disabled={loading}
          whileTap={{ scale: 0.97 }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="spin" /> Analyzing...
            </>
          ) : (
            "Analyze"
          )}
        </motion.button>

        {/* -----------------------------
            CANDIDATE DETAILED ANALYSIS UI
           ----------------------------- */}
        {result && mode === "candidate" && (
          <motion.section
            className="result-panel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <h2>Candidate Analysis</h2>
                <div style={{ marginTop: 8 }}>
                  {result.suitable ? (
                    <span className="status-badge success">
                      <CheckCircle size={14} style={{ verticalAlign: "middle", marginRight: 6 }} /> Suitable for the role
                    </span>
                  ) : (
                    <span className="status-badge fail">
                      <XCircle size={14} style={{ verticalAlign: "middle", marginRight: 6 }} /> Not suitable for the role
                    </span>
                  )}
                </div>
                <p style={{ marginTop: 10, color: "var(--muted)" }}>
                  <b>{result.name}</b> — analysis tailored for your target role: <i>{role}</i>.
                </p>
              </div>

              {/* Utilities: copy / download */}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  className="mode-btn"
                  onClick={copyAnalysis}
                  title="Copy analysis to clipboard"
                  style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}
                >
                  <Copy size={14} /> Copy
                </button>
                <button
                  className="mode-btn"
                  onClick={downloadAnalysisTxt}
                  title="Download analysis as text"
                  style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}
                >
                  <Download size={14} /> Download
                </button>
              </div>
            </div>

            <hr style={{ margin: "14px 0", borderColor: "var(--border)" }} />

            {/* Strengths */}
            <div style={{ marginBottom: 12 }}>
              <h3>Strong Points</h3>
              {result.strengths && result.strengths.length ? (
                <ul>
                  {result.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "var(--muted)" }}>No strong points detected in the AI output.</p>
              )}
            </div>

            {/* Areas for Improvement */}
            <div style={{ marginBottom: 12 }}>
              <h3>Areas for Improvement</h3>
              {result.weaknesses && result.weaknesses.length ? (
                <ul>
                  {result.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "var(--muted)" }}>No weaknesses listed by the AI.</p>
              )}
            </div>

            {/* Improvement Suggestions */}
            <div style={{ marginBottom: 12 }}>
              <h3>Suggestions</h3>
              {result.improvement_suggestions && result.improvement_suggestions.length ? (
                <ul>
                  {result.improvement_suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "var(--muted)" }}>No specific suggestions provided.</p>
              )}
            </div>

            {/* Recommendations (structured) */}
            <div style={{ marginTop: 6 }}>
              <h3>Recommendations</h3>

              {/* Online Courses */}
              <div style={{ marginBottom: 10 }}>
                <strong>Courses:</strong>
                {result.recommendations && result.recommendations.online_courses && result.recommendations.online_courses.length ? (
                  <ul>
                    {result.recommendations.online_courses.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                ) : (
                  <p style={{ color: "var(--muted)" }}>— Try relevant specialization courses on Coursera / edX / Udacity.</p>
                )}
              </div>

              {/* YouTube */}
              <div style={{ marginBottom: 10 }}>
                <strong>YouTube Channels:</strong>
                {result.recommendations && result.recommendations.youtube_channels && result.recommendations.youtube_channels.length ? (
                  <ul>
                    {result.recommendations.youtube_channels.map((y, i) => <li key={i}>{y}</li>)}
                  </ul>
                ) : (
                  <p style={{ color: "var(--muted)" }}>— Search for practical tutorial channels for hands-on learning.</p>
                )}
              </div>

              {/* Career Guides */}
              <div style={{ marginBottom: 10 }}>
                <strong>Career Guides:</strong>
                {result.recommendations && result.recommendations.career_guides && result.recommendations.career_guides.length ? (
                  <ul>
                    {result.recommendations.career_guides.map((g, i) => <li key={i}>{g}</li>)}
                  </ul>
                ) : (
                  <p style={{ color: "var(--muted)" }}>— Read industry career guides to prepare interview strategy.</p>
                )}
              </div>

              {/* Alternative Roles */}
              <div style={{ marginBottom: 10 }}>
                <strong>Alternative Roles:</strong>
                {result.recommendations && result.recommendations.alternative_roles && result.recommendations.alternative_roles.length ? (
                  <ul>
                    {result.recommendations.alternative_roles.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                ) : (
                  <p style={{ color: "var(--muted)" }}>— Consider adjacent roles where skills overlap.</p>
                )}
              </div>

              {/* Skills to Learn */}
              <div style={{ marginBottom: 6 }}>
                <strong>Skills to Learn:</strong>
                {result.recommendations && result.recommendations.skills_to_learn && result.recommendations.skills_to_learn.length ? (
                  <ul>
                    {result.recommendations.skills_to_learn.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                ) : (
                  <p style={{ color: "var(--muted)" }}>— Focus on communication, domain knowledge, and technical gaps.</p>
                )}
              </div>
            </div>
          </motion.section>
        )}

        {/* -----------------------------
            COMPANY MODE SIMPLE RESULTS (kept as before)
           ----------------------------- */}
        {batchResult && mode === "company" && (
          <motion.div
            className="results-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2>🏆 Ranked Resumes</h2>
            <ul>
              {batchResult.ranked.map((r) => (
                <li key={r.file_name} className="result-item">
                  <strong>#{r.rank}</strong> — {r.candidate_name} ({r.file_name})
                  <div>Score: {r.score}</div>
                  <div><b>Summary:</b> {r.summary}</div>
                  <div><em>{r.rank_summary}</em></div>
                </li>
              ))}
            </ul>
            <h3>⭐ Top Fits:</h3>
            <p>{batchResult.topFits.join(", ")}</p>
          </motion.div>
        )}
      </motion.main>

      {/* 🧠 Clippy Assistant */}
      <motion.div className="clippy-side" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
        <div className={`clippy-avatar ${loading ? "talking" : "idle"}`}>
          <svg width="80" height="80" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="clipGrad" x1="0" x2="1">
                <stop offset="0" stopColor="#a3b1c6" />
                <stop offset="1" stopColor="#6c7a94" />
              </linearGradient>
            </defs>
            <circle cx="120" cy="120" r="110" fill="#f5f8fb" />
            <g transform="translate(42,18)">
              <path
                d="M30 30 C30 12, 48 12, 48 30 L48 140 C48 164, 74 168, 86 150 L138 78 C156 54, 140 20, 110 40 L78 62 C66 72, 58 68, 58 52 C58 36, 74 30, 86 38 L130 68"
                fill="none"
                stroke="url(#clipGrad)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <g transform="translate(64,56)">
                <motion.circle
                  cx="6"
                  cy="0"
                  r="6"
                  fill="#202124"
                  animate={{ scaleY: [1, 0.2, 1] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                />
                <motion.circle
                  cx="30"
                  cy="0"
                  r="6"
                  fill="#202124"
                  animate={{ scaleY: [1, 0.2, 1] }}
                  transition={{ repeat: Infinity, duration: 4, delay: 1 }}
                />
                <motion.path
                  d="M4 18 C14 30, 22 30, 34 18"
                  stroke="#202124"
                  strokeWidth="2.5"
                  fill="none"
                  animate={{
                    d: [
                      "M4 18 C14 30, 22 30, 34 18",
                      "M4 24 C14 38, 22 38, 34 24",
                      "M4 18 C14 30, 22 30, 34 18",
                    ],
                  }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                />
              </g>
            </g>
          </svg>
        </div>

        <motion.div key={assistantMessage} className="clippy-bubble" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          {assistantMessage}
        </motion.div>
      </motion.div>

      <footer className="footer">
        <p>© 2025 ResumeHelp AI — Powered by <span>Gemini Intelligence</span></p>
      </footer>
    </div>
  );
}

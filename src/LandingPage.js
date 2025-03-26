import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <h1>Welcome to ResumeHelp AI</h1>
      <p>Optimize your resume using AI-powered analysis.</p>
      <button onClick={() => navigate("/analyze")}>Get Started</button>
    </div>
  );
};

export default LandingPage;

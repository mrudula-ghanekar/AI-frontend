import React from "react";
import { useRouter } from "next/router";

const LandingPage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6">
      {/* Hero Section */}
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">
        AI-Powered Resume Analysis
      </h1>
      <p className="text-lg md:text-xl text-center mb-8 max-w-2xl">
        Optimize your resume, match it with job roles, and get AI-driven insights to land your dream job!
      </p>
      <button
        onClick={() => router.push("/analyze")}
        className="bg-white text-blue-600 px-6 py-3 rounded-full text-lg font-semibold shadow-md hover:bg-gray-200 transition"
      >
        Analyze Resume Now
      </button>

      {/* Features Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="p-6 bg-white bg-opacity-10 rounded-xl">
          <h2 className="text-2xl font-semibold mb-2">AI Matching</h2>
          <p>Instantly match your resume to job roles using AI.</p>
        </div>
        <div className="p-6 bg-white bg-opacity-10 rounded-xl">
          <h2 className="text-2xl font-semibold mb-2">Batch Analysis</h2>
          <p>Upload multiple resumes and get ranked candidates.</p>
        </div>
        <div className="p-6 bg-white bg-opacity-10 rounded-xl">
          <h2 className="text-2xl font-semibold mb-2">Resume Optimization</h2>
          <p>AI-powered suggestions to improve your resume.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <motion.header
        className="landing-hero"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="landing-title">ResumeHelp AI</h1>
        <p className="landing-subtitle">
          Your AI-powered career toolkit for smarter resumes and faster hiring.
        </p>
        <motion.button
          className="cta-button"
          onClick={() => navigate('/app')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started Free
        </motion.button>
      </motion.header>

      <section className="features">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Built for Professionals & Recruiters
        </motion.h2>
        <div className="features-grid">
          {[{
            title: "AI Resume Analysis",
            desc: "Instantly evaluate your resume with insights on strengths, gaps and fit.",
            icon: "📊"
          }, {
            title: "Batch Comparison",
            desc: "Upload multiple resumes and get ranked results for recruiters.",
            icon: "🏢"
          }, {
            title: "Job Fit Scoring",
            desc: "See how well your resume aligns with your target job.",
            icon: "🎯"
          }].map((f, i) => (
            <motion.div
              className="feature-card"
              key={i}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <motion.footer
        className="landing-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <p>© {new Date().getFullYear()} ResumeHelp AI —  Built with ❤️ </p>
      </motion.footer>
    </div>
  );
}

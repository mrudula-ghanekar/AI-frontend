import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Brain, ArrowRight, Rocket, Target, LogIn } from "lucide-react";
import AOS from "aos";
import { motion } from "framer-motion";
import "aos/dist/aos.css";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 900, once: true, easing: "ease-out-cubic" });

    const handleMouseMove = (e) => {
      document.querySelectorAll(".orb").forEach((orb) => {
        const speed = parseFloat(orb.getAttribute("data-speed")) || 0.05;
        const x = (window.innerWidth / 2 - e.pageX) * speed;
        const y = (window.innerHeight / 2 - e.pageY) * speed;
        orb.style.transform = `translate(${x}px, ${y}px)`;
      });
    };
    document.addEventListener("mousemove", handleMouseMove);

    // Voice intro
    const speak = (text) => {
      if (!window.speechSynthesis) return;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      utter.pitch = 1.05;
      utter.rate = 0.95;
      utter.volume = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    };

    const introText =
      "Hello! I’m Clippy, your friendly AI career guide. Welcome to ResumeHelp AI — let's begin your journey!";
    speak(introText);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="home-bg min-h-screen flex flex-col items-center justify-center text-center relative overflow-hidden px-6">
      {/* 🔐 Small Login Button — Top Left Corner */}
      <div className="absolute top-6 left-8 z-50" data-aos="fade-down">
        <button
          onClick={() => navigate("/login")}
          className="login-btn inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-white transition-all duration-300"
        >
          <LogIn className="w-4 h-4" />
          Login
        </button>
      </div>

      {/* Animated background orbs */}
      <div className="orb orb1" data-speed="0.02"></div>
      <div className="orb orb2" data-speed="0.05"></div>
      <div className="orb orb3" data-speed="0.08"></div>

      {/* Hero Section */}
      <div className="hero-section max-w-3xl relative z-10" data-aos="fade-up">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-100 mb-4 leading-tight">
          Welcome to <span className="text-gradient">ResumeHelp AI</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-6">
          Embark on your AI-powered career journey.  
          Each level reveals new insights, challenges, and growth milestones —  
          guiding you closer to your dream role.
        </p>

        {/* Gamified Steps */}
        <div className="journey-path relative my-16">
          <JourneyStep
            icon={<Sparkles />}
            level="Level 1"
            title="Discover Yourself"
            desc="Clippy scans your resume and unlocks insights you didn’t know existed."
          />
          <JourneyConnector />
          <JourneyStep
            icon={<Brain />}
            level="Level 2"
            title="Grow Smarter"
            desc="We identify skills to improve and recommend tailored learning paths."
          />
          <JourneyConnector />
          <JourneyStep
            icon={<Rocket />}
            level="Level 3"
            title="Accelerate Forward"
            desc="Transform insights into action with measurable progress tracking."
          />
          <JourneyConnector />
          <JourneyStep
            icon={<Target />}
            level="Level 4"
            title="Land Your Dream Job"
            desc="We help you fine-tune your profile and match with opportunities."
          />
        </div>

        {/* Start Button */}
        <button
          onClick={() => navigate("/app")}
          className="start-btn inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-white transition-all duration-300"
        >
          Start My Journey
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* 🤖 Clippy Assistant */}
      <motion.div
        className="clippy-widget fixed bottom-6 right-8 z-50 flex items-end gap-3"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="clippy-bubble visible" id="clippyBubble">
          👋 Hi, I’m <strong>Clippy</strong> — your AI career guide.  
          Ready to start your adventure?
        </div>

        <div className="clippy-avatar">
          <svg
            width="80"
            height="80"
            viewBox="0 0 240 240"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0" stopColor="#4CA0FF" />
                <stop offset="1" stopColor="#2A6BFF" />
              </linearGradient>
              <filter id="drop" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="6"
                  stdDeviation="10"
                  floodColor="#0b3b9a"
                  floodOpacity="0.08"
                />
              </filter>
            </defs>

            {/* Background */}
            <circle cx="120" cy="120" r="110" fill="#f6fbff" />

            {/* Paperclip body */}
            <g transform="translate(42,18)" filter="url(#drop)">
              <path
                d="M30 30 C30 12, 48 12, 48 30 L48 140 C48 164, 74 168, 86 150 L138 78 C156 54, 140 20, 110 40 L78 62 C66 72, 58 68, 58 52 C58 36, 74 30, 86 38 L130 68"
                fill="none"
                stroke="url(#g1)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Inner offset for glow */}
              <path
                d="M36 36 C36 20, 50 20, 50 36 L50 136 C50 158, 72 160, 82 144 L132 78 C148 56, 132 24, 106 40 L78 60 C68 68, 60 66, 60 52"
                fill="none"
                stroke="#CBE5FF"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
              />

              {/* Eyes and smile */}
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
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    ease: "easeInOut",
                  }}
                />
              </g>
            </g>
          </svg>
        </div>
      </motion.div>

      <footer className="footer-fade mt-20 text-gray-500 text-sm z-10">
        © {new Date().getFullYear()} Clippy AI — Intelligent Career Companion
      </footer>
    </div>
  );
};

const JourneyStep = ({ icon, level, title, desc }) => (
  <div className="journey-step flex flex-col items-center gap-3 relative">
    <div className="glow-circle p-5 rounded-full flex items-center justify-center text-white text-xl shadow-lg">
      {icon}
    </div>
    <span className="level-text text-sm text-cyan-400 font-semibold">
      {level}
    </span>
    <h4 className="text-gray-100 text-lg font-bold">{title}</h4>
    <p className="text-gray-400 text-sm max-w-[250px]">{desc}</p>
  </div>
);

const JourneyConnector = () => (
  <div className="journey-connector w-1 h-16 bg-gradient-to-b from-cyan-400 to-blue-400 opacity-80 mx-auto relative">
    <span className="connector-glow"></span>
  </div>
);

export default Home;

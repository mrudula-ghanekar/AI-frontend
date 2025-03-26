import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate(); // ✅ Ensure inside Router

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Welcome to ResumeHelp</h1>
      <p style={styles.subText}>Your AI-powered resume analysis tool</p>
      <button style={styles.button} onClick={() => navigate("/home")}>
        Get Started
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#f4f4f4", // Soft gray background
  },
  heading: {
    fontSize: "2.5rem",
    color: "#333", // Darker color for text
    marginBottom: "10px",
  },
  subText: {
    fontSize: "1.2rem",
    color: "#555", // Subtle gray text
    marginBottom: "20px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#0056b3", // Professional Blue
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  buttonHover: {
    backgroundColor: "#003d82", // Darker blue on hover
  },
};

export default LandingPage;

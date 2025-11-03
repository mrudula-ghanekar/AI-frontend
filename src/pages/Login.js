import React from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "./Login.css"; // ✅ Import the new CSS

const Login = () => {
  const navigate = useNavigate();

  return (
    <GoogleOAuthProvider clientId="754334148383-if6k30mtllhcau2sk9rduqjsbpcnvleb.apps.googleusercontent.com">
      <div className="login-bg">
        <div className="login-container">
          <h1>Sign in to ResumeHelp AI</h1>
          <div className="google-login-box">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                const decoded = jwtDecode(credentialResponse.credential);
                console.log("✅ Google User:", decoded);
                navigate("/app");
              }}
              onError={() => console.log("❌ Login Failed")}
            />
          </div>
          <p>Secure sign-in powered by Google Identity</p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;

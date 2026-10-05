import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

import { auth } from "../../Firebase/firebase";

import "./Login.scss";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  // =====================================
  // HANDLE LOGIN
  // =====================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      console.log("User logged in:", userCredential.user);

      setMessage("Login Successful!");

      setTimeout(() => {
        navigate("/home");
      }, 1000);

    } catch (error) {
      console.log("Login error:", error);

      if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (error.code === "auth/user-not-found") {
        setError("User not found.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="login-container">

      <div className="login-card">

        {/* HEADING */}

        <h2>Welcome Back</h2>

        <p className="login-subtitle">
          Log in to your account
        </p>


        <form onSubmit={handleLogin}>

          {/* EMAIL */}

          <div className="email">

            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

          </div>


          {/* PASSWORD */}

          <div className="password">

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

          </div>


          {/* LOGIN BUTTON */}

          <button type="submit">
            Log In
          </button>

        </form>


        {/* SIGN UP LINK */}

        <p className="signup-link">
          Don't have an account?{" "}
          <Link to="/signup">
            Sign Up
          </Link>
        </p>


        {/* SUCCESS MESSAGE */}

        {message && (
          <p className="success-message">
            {message}
          </p>
        )}


        {/* ERROR MESSAGE */}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

      </div>

    </div>
  );
};

export default Login;
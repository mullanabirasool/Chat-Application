import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

import { auth, db } from "../../Firebase/firebase";

import "./SignUp.scss";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================
  // HANDLE SIGN UP
  // =====================================

  const handleSignUp = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      setError("Please fill all fields");
      return;
    }

    try {
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const user = userCredential.user;

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          name: name.trim(),
          email: email.trim(),
        }
      );

      setMessage("Sign Up successful!");

      setName("");
      setEmail("");
      setPassword("");

    } catch (error) {
      console.error("Sign Up error:", error);

      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (error.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="signup-container">

      <form
        className="signup-form"
        onSubmit={handleSignUp}
        autoComplete="off"
      >

        {/* =====================================
            HEADING
        ===================================== */}

        <h2>Welcome to Chat App</h2>

        <div className="signup-subtitle">
          Create your account
        </div>


        {/* =====================================
            NAME
        ===================================== */}

        <div className="form-group">

          <label htmlFor="name">
            Name
          </label>

          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
          />

        </div>


        {/* =====================================
            EMAIL
        ===================================== */}

        <div className="form-group">

          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="new-email"
          />

        </div>


        {/* =====================================
            PASSWORD
        ===================================== */}

        <div className="form-group">

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />

        </div>


        {/* =====================================
            SIGN UP BUTTON
        ===================================== */}

        <button type="submit">
          Sign Up
        </button>


        {/* =====================================
            LOGIN LINK
        ===================================== */}

        <p className="login-link">
          Already have an account?{" "}

          <Link to="/login">
            Log In
          </Link>
        </p>


        {/* =====================================
            SUCCESS MESSAGE
        ===================================== */}

        {message && (
          <p className="success-message">
            {message}
          </p>
        )}


        {/* =====================================
            ERROR MESSAGE
        ===================================== */}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

      </form>

    </div>
  );
};

export default SignUp;
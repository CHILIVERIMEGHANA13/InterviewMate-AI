import { useState } from "react";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      alert(response.data.message);

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      window.location.href = "/dashboard";
    } catch (error) {
      alert(
        error.response?.data?.message || "Login Failed"
      );
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "black",
      }}
    >
      <div
        style={{
          background: "#1e1e1e",
          padding: "40px",
          borderRadius: "15px",
          width: "350px",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "white", marginBottom: "30px" }}>Login</h1>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "8px",
            border: "none",
            outline: "none",
            fontSize: "14px",
          }}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "8px",
            border: "none",
            outline: "none",
            fontSize: "14px",
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "12px",
            background: "#00bfff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            marginBottom: "15px",
          }}
        >
          Login
        </button>

        {/* ✅ Added Signup Link */}
        <p style={{ color: "#aaa", fontSize: "14px" }}>
          Don't have an account?{" "}
          <span
            onClick={() => window.location.href = "/signup"}
            style={{
              color: "#00bfff",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Sign Up
          </span>
        </p>

      </div>
    </div>
  );
}

export default Login;
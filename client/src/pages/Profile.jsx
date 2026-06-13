import { useState, useEffect } from "react";
import axios from "axios";

function Profile() {
  const [user, setUser] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Safely get user from localStorage
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log("Error getting user:", error);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchResults = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/interview/results/${user?.email}`
        );
        setResults(response.data);
      } catch (error) {
        console.log("Error fetching results:", error);
      }
      setLoading(false);
    };

    fetchResults();
  }, [user]);

  // ✅ Calculate Stats
  const totalInterviews = results.length;
  const avgScore =
    totalInterviews > 0
      ? Math.round(
          results.reduce((sum, r) => sum + r.score, 0) / totalInterviews
        )
      : 0;
  const bestScore =
    totalInterviews > 0
      ? Math.max(...results.map((r) => r.score))
      : 0;

  // ✅ Logout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // ✅ Not logged in
  if (!user && !loading) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
      }}>
        <h2>⚠️ Please Login First!</h2>
        <button
          onClick={() => (window.location.href = "/login")}
          style={{
            padding: "12px 25px",
            backgroundColor: "#00bfff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  // ✅ Loading
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
      }}>
        <h2>Loading Profile... 👤</h2>
        <div style={{
          width: "50px",
          height: "50px",
          border: "5px solid #333",
          borderTop: "5px solid #00bfff",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "black",
      color: "white",
      padding: "40px",
    }}>

      {/* Header */}
      <h1 style={{ textAlign: "center", marginBottom: "40px" }}>
        👤 My Profile
      </h1>

      {/* Profile Card */}
      <div style={{
        backgroundColor: "#1e1e1e",
        borderRadius: "15px",
        padding: "40px",
        width: "50%",
        margin: "0 auto 40px auto",
        textAlign: "center",
        borderTop: "4px solid #00bfff",
      }}>

        {/* Avatar */}
        <div style={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          backgroundColor: "#00bfff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "0 auto 20px auto",
          fontSize: "40px",
          fontWeight: "bold",
          color: "white",
        }}>
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>

        {/* Name */}
        <h2 style={{ margin: "0 0 10px 0", fontSize: "28px" }}>
          {user?.name || "User"}
        </h2>

        {/* Email */}
        <p style={{ color: "#aaa", fontSize: "16px", marginBottom: "25px" }}>
          📧 {user?.email || "No email"}
        </p>

        <hr style={{ border: "1px solid #333", marginBottom: "25px" }} />

        {/* Stats */}
        <div style={{
          display: "flex",
          justifyContent: "space-around",
          flexWrap: "wrap",
          gap: "20px",
        }}>
          <div>
            <h2 style={{ color: "#00bfff", margin: 0, fontSize: "36px" }}>
              {totalInterviews}
            </h2>
            <p style={{ color: "#aaa", margin: 0, fontSize: "14px" }}>
              Total Interviews
            </p>
          </div>
          <div>
            <h2 style={{ color: "#ffaa00", margin: 0, fontSize: "36px" }}>
              {avgScore}/10
            </h2>
            <p style={{ color: "#aaa", margin: 0, fontSize: "14px" }}>
              Average Score
            </p>
          </div>
          <div>
            <h2 style={{ color: "#00ff88", margin: 0, fontSize: "36px" }}>
              {bestScore}/10
            </h2>
            <p style={{ color: "#aaa", margin: 0, fontSize: "14px" }}>
              Best Score
            </p>
          </div>
        </div>
      </div>

      {/* Recent Interviews */}
      <div style={{ width: "50%", margin: "0 auto 40px auto" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          📝 Recent Interviews
        </h2>

        {totalInterviews === 0 ? (
          <div style={{
            textAlign: "center",
            backgroundColor: "#1e1e1e",
            padding: "30px",
            borderRadius: "10px",
          }}>
            <p style={{ color: "#aaa" }}>No interviews yet! 🚀</p>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              style={{
                marginTop: "15px",
                padding: "10px 20px",
                backgroundColor: "#00bfff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Start Interview
            </button>
          </div>
        ) : (
          results.slice(0, 3).map((result, index) => (
            <div key={index} style={{
              backgroundColor: "#1e1e1e",
              padding: "15px 20px",
              borderRadius: "10px",
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderLeft:
                result.score >= 8
                  ? "4px solid #00ff88"
                  : result.score >= 5
                  ? "4px solid #ffaa00"
                  : "4px solid #ff4444",
            }}>
              <div>
                <p style={{ margin: 0, fontWeight: "bold" }}>
                  {result.role === "java"
                    ? "☕ Java Developer"
                    : result.role === "fullstack"
                    ? "💻 Full Stack Developer"
                    : result.role === "dataanalyst"
                    ? "📊 Data Analyst"
                    : "📄 Resume Based"}
                </p>
                <p style={{ margin: 0, color: "#aaa", fontSize: "13px" }}>
                  {new Date(result.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <h3 style={{
                margin: 0,
                color:
                  result.score >= 8
                    ? "#00ff88"
                    : result.score >= 5
                    ? "#ffaa00"
                    : "#ff4444",
              }}>
                {result.score}/10
              </h3>
            </div>
          ))
        )}
      </div>

      {/* Buttons */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        flexWrap: "wrap",
        marginBottom: "40px",
      }}>
        <button
          onClick={() => (window.location.href = "/dashboard")}
          style={{
            padding: "12px 25px",
            backgroundColor: "#00bfff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          ← Back to Dashboard
        </button>

        <button
          onClick={() => (window.location.href = "/analytics")}
          style={{
            padding: "12px 25px",
            backgroundColor: "#1e1e1e",
            color: "#ffaa00",
            border: "2px solid #ffaa00",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          📊 View Full Analytics
        </button>

        <button
          onClick={handleLogout}
          style={{
            padding: "12px 25px",
            backgroundColor: "#ff4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;
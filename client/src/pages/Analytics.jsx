import { useState, useEffect } from "react";
import axios from "axios";

function Analytics() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const roleNames = {
    java: "Java Developer",
    fullstack: "Full Stack Developer",
    dataanalyst: "Data Analyst",
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/interview/results/${user?.email}`
        );
        setResults(response.data);
        setLoading(false);
      } catch (error) {
        console.log("Error fetching results:", error);
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

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

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "black",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <h2>Loading Analytics... 📊</h2>
        <div
          style={{
            width: "50px",
            height: "50px",
            border: "5px solid #333",
            borderTop: "5px solid #00bfff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
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
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "black",
        color: "white",
        padding: "40px",
      }}
    >
      {/* ✅ Header */}
      <h1 style={{ textAlign: "center", marginBottom: "10px" }}>
        📊 Performance Analytics
      </h1>
      <p style={{ textAlign: "center", color: "#aaa", marginBottom: "40px" }}>
        Welcome, {user?.name}
      </p>

      {/* ✅ Stats Cards */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "30px",
          flexWrap: "wrap",
          marginBottom: "50px",
        }}
      >
        {/* Total Interviews */}
        <div
          style={{
            backgroundColor: "#1e1e1e",
            padding: "30px",
            borderRadius: "15px",
            width: "200px",
            textAlign: "center",
            borderTop: "4px solid #00bfff",
          }}
        >
          <h1 style={{ fontSize: "50px", color: "#00bfff", margin: 0 }}>
            {totalInterviews}
          </h1>
          <p style={{ color: "#aaa" }}>Total Interviews</p>
        </div>

        {/* Average Score */}
        <div
          style={{
            backgroundColor: "#1e1e1e",
            padding: "30px",
            borderRadius: "15px",
            width: "200px",
            textAlign: "center",
            borderTop: "4px solid #ffaa00",
          }}
        >
          <h1 style={{ fontSize: "50px", color: "#ffaa00", margin: 0 }}>
            {avgScore}
          </h1>
          <p style={{ color: "#aaa" }}>Average Score /10</p>
        </div>

        {/* Best Score */}
        <div
          style={{
            backgroundColor: "#1e1e1e",
            padding: "30px",
            borderRadius: "15px",
            width: "200px",
            textAlign: "center",
            borderTop: "4px solid #00ff88",
          }}
        >
          <h1 style={{ fontSize: "50px", color: "#00ff88", margin: 0 }}>
            {bestScore}
          </h1>
          <p style={{ color: "#aaa" }}>Best Score /10</p>
        </div>
      </div>

      {/* ✅ Interview History */}
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
        📝 Interview History
      </h2>

      {totalInterviews === 0 ? (
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#aaa", fontSize: "18px" }}>
            No interviews yet! Go give your first interview! 🚀
          </p>
        </div>
      ) : (
        results.map((result, index) => (
          <div
            key={index}
            style={{
              backgroundColor: "#1e1e1e",
              padding: "20px",
              margin: "15px auto",
              width: "60%",
              borderRadius: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderLeft:
                result.score >= 8
                  ? "4px solid #00ff88"
                  : result.score >= 5
                  ? "4px solid #ffaa00"
                  : "4px solid #ff4444",
            }}
          >
            {/* Left side */}
            <div>
              <h3 style={{ margin: 0, marginBottom: "5px" }}>
                {roleNames[result.role] || result.role}
              </h3>
              <p style={{ color: "#aaa", margin: 0, fontSize: "14px" }}>
                {new Date(result.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Right side - Score */}
            <div style={{ textAlign: "center" }}>
              <h2
                style={{
                  margin: 0,
                  color:
                    result.score >= 8
                      ? "#00ff88"
                      : result.score >= 5
                      ? "#ffaa00"
                      : "#ff4444",
                }}
              >
                {result.score} / 10
              </h2>
              <p style={{ color: "#aaa", margin: 0, fontSize: "12px" }}>
                {result.score >= 8
                  ? "🏆 Excellent"
                  : result.score >= 5
                  ? "👍 Good"
                  : "💪 Keep Practicing"}
              </p>
            </div>
          </div>
        ))
      )}

      {/* ✅ Only ONE Back to Dashboard Button */}
      <div
        style={{
          textAlign: "center",
          marginTop: "40px",
          marginBottom: "40px",
        }}
      >
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
      </div>

    </div>
  );
}

export default Analytics;
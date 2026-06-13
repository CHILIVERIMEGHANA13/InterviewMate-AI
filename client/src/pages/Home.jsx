function Home() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to right, #141e30, #243b55)",
        color: "white",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "60px",
          marginBottom: "10px",
        }}
      >
        InterviewMate AI
      </h1>

      <p
        style={{
          fontSize: "24px",
          marginBottom: "30px",
        }}
      >
        AI Powered Mock Interview Platform
      </p>

      <button
        onClick={() => window.location.href = "/login"} // ✅ Added navigation!
        style={{
          padding: "15px 30px",
          fontSize: "18px",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          backgroundColor: "#00bfff",
          color: "white",
        }}
      >
        Start Interview
      </button>
    </div>
  );
}

export default Home;
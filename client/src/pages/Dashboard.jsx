function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "black",
        color: "white",
        padding: "40px",
        position: "relative", // ✅ Important for absolute positioning
      }}
    >
      {/* ✅ Profile Button - Top Right Corner */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "30px",
        }}
      >
        <button
          onClick={() => (window.location.href = "/profile")}
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            backgroundColor: "#00bfff",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "22px",
            fontWeight: "bold",
          }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </button>
      </div>

      {/* ✅ Header */}
      <div style={{ textAlign: "center", marginBottom: "50px" }}>
        <h1>Welcome {user?.name} 👋</h1>
        <p style={{ color: "#aaa" }}>{user?.email}</p>
      </div>

      <h2 style={{ textAlign: "center", marginBottom: "40px" }}>
        Choose Your Interview Category
      </h2>

      {/* ✅ Role Cards */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "30px",
          flexWrap: "wrap",
        }}
      >
        {/* Java */}
        <div
          style={{
            backgroundColor: "#1e1e1e",
            width: "280px",
            padding: "25px",
            borderRadius: "15px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3>☕ Java Developer</h3>
          <p>
            Practice Core Java, OOPs, Collections, Exception Handling,
            Multithreading and Interview Questions.
          </p>
          <button
            onClick={() => (window.location.href = "/interview?role=java")}
            style={{
              marginTop: "auto",
              alignSelf: "center",
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#00bfff",
              color: "white",
              cursor: "pointer",
            }}
          >
            Start Interview
          </button>
        </div>

        {/* Full Stack */}
        <div
          style={{
            backgroundColor: "#1e1e1e",
            width: "280px",
            padding: "25px",
            borderRadius: "15px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3>💻 Full Stack Developer</h3>
          <p>
            Practice React, Node.js, Express.js, MongoDB, APIs and MERN
            Stack Interview Questions.
          </p>
          <button
            onClick={() =>
              (window.location.href = "/interview?role=fullstack")
            }
            style={{
              marginTop: "auto",
              alignSelf: "center",
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#00bfff",
              color: "white",
              cursor: "pointer",
            }}
          >
            Start Interview
          </button>
        </div>

        {/* Data Analyst */}
        <div
          style={{
            backgroundColor: "#1e1e1e",
            width: "280px",
            padding: "25px",
            borderRadius: "15px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3>📊 Data Analyst</h3>
          <p>
            Practice SQL, Excel, Power BI, Statistics, Data Visualization
            and Analytics Interview Questions.
          </p>
          <button
            onClick={() =>
              (window.location.href = "/interview?role=dataanalyst")
            }
            style={{
              marginTop: "auto",
              alignSelf: "center",
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#00bfff",
              color: "white",
              cursor: "pointer",
            }}
          >
            Start Interview
          </button>
        </div>
      </div>

      {/* ✅ Bottom Buttons */}
      <div
        style={{
          textAlign: "center",
          marginTop: "50px",
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        {/* Resume Analyzer */}
        <button
          onClick={() => (window.location.href = "/resume")}
          style={{
            padding: "12px 30px",
            backgroundColor: "#1e1e1e",
            color: "#00ff88",
            border: "2px solid #00ff88",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          📄 Resume Analyzer
        </button>

        {/* Analytics */}
        <button
          onClick={() => (window.location.href = "/analytics")}
          style={{
            padding: "12px 30px",
            backgroundColor: "#1e1e1e",
            color: "#00bfff",
            border: "2px solid #00bfff",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          📊 View My Performance Analytics
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
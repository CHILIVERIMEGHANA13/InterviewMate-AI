import { useState, useEffect } from "react";
import axios from "axios";

function Results() {
  const role = localStorage.getItem("interviewRole") || "java";
  const answers = JSON.parse(localStorage.getItem("interviewAnswers")) || [];

  const questionBank = {
    java: [
      "What is Java and why is it platform independent?",
      "What are the 4 pillars of OOP?",
      "What is the difference between JDK, JRE and JVM?",
      "What is the difference between Abstract class and Interface?",
      "Explain Exception Handling in Java with example.",
      "What is Collections Framework? Name important classes.",
      "What is multithreading? Difference between Thread and Runnable?",
      "What is the difference between HashMap and ConcurrentHashMap?",
      "Explain Java 8 features - Stream API and Lambda expressions.",
      "What is garbage collection in Java? Explain different GC algorithms.",
    ],
    fullstack: [
      "What is React and why do we use it?",
      "What is the difference between SQL and NoSQL databases?",
      "What is REST API? Explain HTTP methods.",
      "What is useState and useEffect in React? Give examples.",
      "What is middleware in Express.js?",
      "Explain JWT authentication. How does it work?",
      "What is CORS and why do we need it?",
      "What is the Virtual DOM in React and how does it work?",
      "Explain the MERN stack architecture with data flow.",
      "What are React performance optimization techniques?",
    ],
    dataanalyst: [
      "What is Data Analysis? Explain the steps involved.",
      "What is the difference between mean, median and mode?",
      "What are SQL joins? Explain with examples.",
      "What is the difference between OLAP and OLTP?",
      "Explain normalization in databases with examples.",
      "What is Power BI? How is it different from Excel?",
      "What is data cleaning and why is it important?",
      "What is the difference between supervised and unsupervised learning?",
      "Explain regression analysis and when to use it.",
      "What are window functions in SQL? Give examples.",
    ],
  };

  const roleNames = {
    java: "Java Developer",
    fullstack: "Full Stack Developer",
    dataanalyst: "Data Analyst",
  };

  const questions = questionBank[role] || questionBank["java"];

  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    const evaluateAll = async () => {
      const results = [];

      for (let i = 0; i < questions.length; i++) {
        try {
          console.log(`Evaluating question ${i + 1}...`);

          const response = await axios.post(
            "http://localhost:5000/api/interview/evaluate",
            {
              question: questions[i],
              answer: answers[i] || "No answer provided",
              role: roleNames[role],
            }
          );

          console.log(`Result ${i + 1}:`, response.data);
          results.push(response.data);

        } catch (error) {
          console.log(`Error evaluating Q${i + 1}:`, error);
          results.push({
            score: 0,
            feedback: "Could not evaluate this answer",
            correct_answer: "Please try again",
          });
        }
      }

      // ✅ Calculate total score out of 10
      const total = results.reduce((sum, r) => sum + (r.score || 0), 0);
      const outOf10 = Math.round(total / questions.length);

      // ✅ Save result to MongoDB - INSIDE async function
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        await axios.post(
          "http://localhost:5000/api/interview/save-result",
          {
            userId: user?.email,
            userName: user?.name,
            role: role,
            score: outOf10,
            totalQuestions: questions.length,
            evaluations: results,
          }
        );
        console.log("✅ Result saved to MongoDB!");
      } catch (saveError) {
        console.log("❌ Could not save result:", saveError);
      }

      setEvaluations(results);
      setTotalScore(outOf10);
      setLoading(false);
    };

    evaluateAll();
  }, []);

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
        <h2>🤖 AI is evaluating your answers...</h2>
        <p style={{ color: "#aaa" }}>Please wait a moment</p>
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
      {/* Header */}
      <h1 style={{ textAlign: "center", marginBottom: "10px" }}>
        Interview Results 🎉
      </h1>
      <p
        style={{
          textAlign: "center",
          color: "#00bfff",
          fontSize: "18px",
          marginBottom: "40px",
        }}
      >
        Role: {roleNames[role]}
      </p>

      {/* Questions + AI Feedback */}
      {questions.map((question, index) => (
        <div
          key={index}
          style={{
            backgroundColor: "#1e1e1e",
            padding: "25px",
            margin: "20px auto",
            width: "70%",
            borderRadius: "10px",
            borderLeft:
              evaluations[index]?.score >= 5
                ? "4px solid #00ff88"
                : "4px solid #ff4444",
          }}
        >
          <h2>Question {index + 1}</h2>

          <p>
            <strong style={{ color: "#00bfff" }}>Question:</strong>
          </p>
          <p>{question}</p>

          <p>
            <strong style={{ color: "#00bfff" }}>Your Answer:</strong>
          </p>
          <p style={{ color: "#fff" }}>
            {answers[index] || "❌ No Answer Provided"}
          </p>

          {/* AI Score */}
          <p>
            <strong style={{ color: "#00bfff" }}>AI Score: </strong>
            <span
              style={{
                color:
                  evaluations[index]?.score >= 7
                    ? "#00ff88"
                    : evaluations[index]?.score >= 4
                    ? "#ffaa00"
                    : "#ff4444",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              {evaluations[index]?.score ?? 0} / 10
            </span>
          </p>

          {/* AI Feedback */}
          <p>
            <strong style={{ color: "#00bfff" }}>AI Feedback:</strong>
          </p>
          <p style={{ color: "#ccc" }}>{evaluations[index]?.feedback}</p>

          {/* Correct Answer */}
          <p>
            <strong style={{ color: "#00bfff" }}>Correct Answer:</strong>
          </p>
          <p style={{ color: "#aaffaa" }}>
            {evaluations[index]?.correct_answer}
          </p>
        </div>
      ))}

      {/* Total Score */}
      <div
        style={{
          textAlign: "center",
          backgroundColor: "#1e1e1e",
          padding: "30px",
          borderRadius: "15px",
          width: "40%",
          margin: "40px auto",
        }}
      >
        <h2>Your Total Score</h2>
        <h1
          style={{
            fontSize: "60px",
            color:
              totalScore >= 8
                ? "#00ff88"
                : totalScore >= 5
                ? "#ffaa00"
                : "#ff4444",
          }}
        >
          {totalScore} / 10
        </h1>
        <p
          style={{
            fontSize: "18px",
            color:
              totalScore >= 8
                ? "#00ff88"
                : totalScore >= 5
                ? "#ffaa00"
                : "#ff4444",
          }}
        >
          {totalScore >= 8
            ? "🏆 Excellent Performance!"
            : totalScore >= 5
            ? "👍 Good Effort! Keep Practicing!"
            : "💪 Need More Practice!"}
        </p>

        <button
          onClick={() => (window.location.href = "/dashboard")}
          style={{
            marginTop: "20px",
            padding: "12px 25px",
            backgroundColor: "#00bfff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Results;
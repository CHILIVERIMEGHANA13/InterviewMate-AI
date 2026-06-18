import { useState, useEffect, useRef } from "react";

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

function Interview() {
  const params = new URLSearchParams(window.location.search);
  const role = params.get("role") || "java";
  const questions = questionBank[role] || questionBank["java"];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [showInterview, setShowInterview] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [interimText, setInterimText] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const getDifficulty = (index) => {
    if (index < 3) return { label: "Basic", color: "#00ff88" };
    if (index < 7) return { label: "Intermediate", color: "#ffaa00" };
    return { label: "Advanced", color: "#ff4444" };
  };

  const difficulty = getDifficulty(currentQuestion);

  const roleNames = {
    java: "Java Developer",
    fullstack: "Full Stack Developer",
    dataanalyst: "Data Analyst",
  };

  // ✅ Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) setAnswer((prev) => (prev + " " + finalTranscript).trim());
      setInterimText(interimTranscript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => {
      setIsListening(false);
      setInterimText("");
    };
    recognitionRef.current = recognition;
  }, []);

  // ✅ Camera Setup
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch (err) {
      setCameraError("Camera permission denied.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  };

  useEffect(() => {
    if (showInterview) startCamera();
  }, [showInterview]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // ✅ Start Listening
  const startListening = async () => {
    if (!recognitionRef.current || isListening) return;
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setAnswer("");
      setInterimText("");
      try { recognitionRef.current.abort(); } catch (e) {}
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      alert("Please allow microphone permission!");
    }
  };

  // ✅ Stop Listening
  const stopListening = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
    setInterimText("");
  };

  const handleNext = () => {
    if (answer.trim() === "" && interimText.trim() === "") {
      alert("Please speak your answer first!");
      return;
    }
    if (isListening) stopListening();
    const finalAnswer = answer || interimText;
    const updatedAnswers = [...answers, finalAnswer];
    setAnswers(updatedAnswers);
    setAnswer("");
    setInterimText("");
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      stopCamera();
      localStorage.setItem("interviewAnswers", JSON.stringify(updatedAnswers));
      localStorage.setItem("interviewRole", role);
      window.location.href = "/results";
    }
  };

  const progress = (currentQuestion / questions.length) * 100;

  // ============================
  // ✅ PAGE 1 — TIPS PAGE
  // ============================
  if (!showInterview) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "black",
        color: "white",
        padding: "40px",
        textAlign: "center",
      }}>
        <h1 style={{ marginBottom: "5px" }}>
          {roleNames[role]} Mock Interview
        </h1>
        <p style={{ color: "#aaa", marginBottom: "30px" }}>
          This is a Voice-Only interview! Speak your answers clearly!
        </p>

        <div style={{
          backgroundColor: "#1a1a2e",
          border: "1px solid #333",
          borderRadius: "15px",
          padding: "30px",
          width: "65%",
          margin: "0 auto 30px auto",
          textAlign: "left",
        }}>
          <h2 style={{ color: "#ffaa00", marginBottom: "20px", textAlign: "center" }}>
            🎤 Voice Interview Instructions
          </h2>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "25px",
          }}>
            <div style={{
              backgroundColor: "#ff444422",
              border: "1px solid #ff4444",
              borderRadius: "10px",
              padding: "15px",
              flex: "1",
              minWidth: "130px",
              textAlign: "center",
            }}>
              <h2 style={{ color: "#ff4444", margin: 0 }}>0-3/10</h2>
              <p style={{ color: "#ff4444", margin: "5px 0", fontWeight: "bold" }}>❌ Poor</p>
              <p style={{ color: "#aaa", fontSize: "13px", margin: 0 }}>One word or no meaningful answer</p>
            </div>

            <div style={{
              backgroundColor: "#ffaa0022",
              border: "1px solid #ffaa00",
              borderRadius: "10px",
              padding: "15px",
              flex: "1",
              minWidth: "130px",
              textAlign: "center",
            }}>
              <h2 style={{ color: "#ffaa00", margin: 0 }}>4-6/10</h2>
              <p style={{ color: "#ffaa00", margin: "5px 0", fontWeight: "bold" }}>👍 Partial</p>
              <p style={{ color: "#aaa", fontSize: "13px", margin: 0 }}>Basic answer with some knowledge</p>
            </div>

            <div style={{
              backgroundColor: "#00bfff22",
              border: "1px solid #00bfff",
              borderRadius: "10px",
              padding: "15px",
              flex: "1",
              minWidth: "130px",
              textAlign: "center",
            }}>
              <h2 style={{ color: "#00bfff", margin: 0 }}>7-8/10</h2>
              <p style={{ color: "#00bfff", margin: "5px 0", fontWeight: "bold" }}>⭐ Good</p>
              <p style={{ color: "#aaa", fontSize: "13px", margin: 0 }}>Clear answer with explanation</p>
            </div>

            <div style={{
              backgroundColor: "#00ff8822",
              border: "1px solid #00ff88",
              borderRadius: "10px",
              padding: "15px",
              flex: "1",
              minWidth: "130px",
              textAlign: "center",
            }}>
              <h2 style={{ color: "#00ff88", margin: 0 }}>9-10/10</h2>
              <p style={{ color: "#00ff88", margin: "5px 0", fontWeight: "bold" }}>🏆 Excellent</p>
              <p style={{ color: "#aaa", fontSize: "13px", margin: 0 }}>Detailed answer with examples</p>
            </div>
          </div>

          <div style={{ backgroundColor: "#ffffff11", borderRadius: "10px", padding: "20px" }}>
            <p style={{ color: "#00ff88", margin: "0 0 12px 0", fontWeight: "bold", fontSize: "16px" }}>
              🎤 How to Use Voice Interview:
            </p>
            <ul style={{ color: "#ccc", margin: 0, paddingLeft: "20px", fontSize: "14px", lineHeight: "2.2" }}>
              <li>Click <strong style={{ color: "#00ff88" }}>🎤 green mic button</strong> to start</li>
              <li>Allow microphone and camera permission</li>
              <li>Speak your answer <strong style={{ color: "white" }}>clearly and loudly</strong></li>
              <li>Watch the <strong style={{ color: "#ff4444" }}>● REC waveform</strong> while speaking</li>
              <li>Click <strong style={{ color: "#ff4444" }}>🔴 red button</strong> when done</li>
              <li>Click <strong style={{ color: "#00bfff" }}>Next Question →</strong> to continue</li>
              <li>Use <strong style={{ color: "white" }}>Google Chrome</strong> for best results!</li>
            </ul>
          </div>

          <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "30px", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ color: "#00bfff", margin: 0 }}>{questions.length}</h2>
              <p style={{ color: "#aaa", margin: 0, fontSize: "14px" }}>Total Questions</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ color: "#00ff88", margin: 0 }}>🎤</h2>
              <p style={{ color: "#aaa", margin: 0, fontSize: "14px" }}>Voice Only</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ color: "#ffaa00", margin: 0 }}>📷</h2>
              <p style={{ color: "#aaa", margin: 0, fontSize: "14px" }}>Camera On</p>
            </div>
          </div>
        </div>

        {!voiceSupported && (
          <div style={{
            backgroundColor: "#ff444422",
            border: "1px solid #ff4444",
            borderRadius: "10px",
            padding: "15px",
            width: "65%",
            margin: "0 auto 20px auto",
          }}>
            <p style={{ color: "#ff4444", margin: 0 }}>
              ⚠️ Voice not supported! Please use <strong>Google Chrome</strong>!
            </p>
          </div>
        )}

        <button
          onClick={() => setShowInterview(true)}
          disabled={!voiceSupported}
          style={{
            padding: "15px 40px",
            backgroundColor: voiceSupported ? "#00bfff" : "#555",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: voiceSupported ? "pointer" : "not-allowed",
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "15px",
          }}
        >
          🚀 Start Voice Interview
        </button>

        <br />

        <button
          onClick={() => (window.location.href = "/dashboard")}
          style={{
            padding: "10px 25px",
            backgroundColor: "#1e1e1e",
            color: "#aaa",
            border: "1px solid #444",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  // ============================
  // ✅ PAGE 2 — VOICE INTERVIEW
  // ============================
  return (
    <div style={{
      minHeight: "100vh",
      background: "black",
      color: "white",
      padding: "40px",
      textAlign: "center",
      position: "relative",
    }}>

      {/* ✅ Camera Preview - Top Right */}
      <div style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        width: "200px",
        borderRadius: "12px",
        overflow: "hidden",
        border: cameraOn ? "2px solid #00ff88" : "1px solid #555",
        backgroundColor: "#111",
        zIndex: 999,
        boxShadow: "0 0 15px rgba(0,0,0,0.5)",
      }}>
        <div style={{
          backgroundColor: "#000000cc",
          padding: "6px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: cameraOn ? "#00ff88" : "#ff4444",
              display: "inline-block",
              animation: cameraOn ? "blink 2s infinite" : "none",
            }} />
            <span style={{ color: "white", fontSize: "11px" }}>
              {cameraOn ? "● LIVE" : "○ OFF"}
            </span>
          </div>
          <span style={{ color: "#aaa", fontSize: "11px" }}>📷</span>
        </div>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: "100%", height: "150px", objectFit: "cover", display: "block" }}
        />
        {cameraError && (
          <div style={{ padding: "8px", backgroundColor: "#ff444422" }}>
            <p style={{ color: "#ff4444", margin: 0, fontSize: "11px" }}>{cameraError}</p>
          </div>
        )}
      </div>

      <h1 style={{ marginBottom: "5px" }}>
        🎤 {roleNames[role]} Voice Interview
      </h1>

      {/* Progress Bar */}
      <div style={{
        width: "60%",
        margin: "20px auto",
        backgroundColor: "#333",
        borderRadius: "10px",
        height: "10px",
      }}>
        <div style={{
          width: `${progress}%`,
          backgroundColor: "#00bfff",
          height: "10px",
          borderRadius: "10px",
          transition: "width 0.3s ease",
        }} />
      </div>

      {/* Question Card */}
      <div style={{
        background: "#1e1e1e",
        padding: "30px",
        borderRadius: "15px",
        width: "60%",
        margin: "20px auto",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}>
          <h2 style={{ margin: 0 }}>
            Question {currentQuestion + 1} / {questions.length}
          </h2>
          <span style={{
            backgroundColor: difficulty.color,
            color: "black",
            padding: "4px 12px",
            borderRadius: "20px",
            fontWeight: "bold",
            fontSize: "14px",
          }}>
            {difficulty.label}
          </span>
        </div>

        <h3 style={{ color: "#00bfff", marginBottom: "30px", textAlign: "left", fontSize: "20px" }}>
          {questions[currentQuestion]}
        </h3>

        {/* ✅ Big Mic Button */}
        <div style={{ marginBottom: "25px" }}>
          {!isListening ? (
            <button
              onClick={startListening}
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                backgroundColor: "#00ff88",
                color: "black",
                border: "none",
                cursor: "pointer",
                fontSize: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                boxShadow: "0 0 20px #00ff8866",
              }}
            >
              🎤
            </button>
          ) : (
            <button
              onClick={stopListening}
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                backgroundColor: "#ff4444",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontSize: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                animation: "pulse 1s infinite",
                boxShadow: "0 0 20px #ff444466",
              }}
            >
              🔴
            </button>
          )}

          <p style={{
            color: isListening ? "#00ff88" : "#aaa",
            marginTop: "15px",
            fontSize: "16px",
            fontWeight: "bold",
          }}>
            {isListening ? "🎤 Listening... Speak now!" : "Click mic to start speaking"}
          </p>
        </div>

        {/* ✅ Audio Waveform Visualizer */}
        <div style={{
          backgroundColor: "#0a1628",
          borderRadius: "15px",
          padding: "25px 20px",
          marginBottom: "20px",
          border: isListening
            ? "2px solid #ff4444"
            : answer
            ? "2px solid #00bfff"
            : "1px solid #1e3a5f",
          transition: "all 0.3s ease",
          minHeight: "120px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>

          {/* Recording waveform */}
          {isListening && (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "15px",
              width: "100%",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "3px", flex: 1 }}>
                {[3,5,8,12,18,22,18,25,30,25,18,22,18,12,8,12,18,22,25,22,18,12,8,5,3].map((h, i) => (
                  <div key={i} style={{
                    width: "5px",
                    backgroundColor: "rgba(200,220,255,0.8)",
                    borderRadius: "3px",
                    animation: `waveBar ${0.4 + (i % 7) * 0.1}s ease-in-out infinite alternate`,
                    height: `${h}px`,
                  }} />
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <span style={{ fontSize: "30px" }}>🎙️</span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: "#ff4444",
                    animation: "recBlink 1s infinite",
                  }} />
                  <span style={{ color: "#ff4444", fontWeight: "bold", fontSize: "20px", letterSpacing: "2px" }}>
                    REC
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Interim text */}
          {interimText && isListening && (
            <p style={{ color: "#aaa", margin: "10px 0 0 0", fontSize: "14px", fontStyle: "italic" }}>
              {interimText}
            </p>
          )}

          {/* Answer after recording */}
          {answer && !isListening && (
            <div style={{ width: "100%", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <p style={{ color: "#00ff88", margin: 0, fontSize: "13px", fontWeight: "bold" }}>
                  ✅ Answer Recorded
                </p>
              </div>
              <p style={{ color: "white", margin: 0, fontSize: "15px", lineHeight: "1.6" }}>
                {answer}
              </p>
            </div>
          )}

          {/* Idle flat line */}
          {!isListening && !answer && !interimText && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "3px", justifyContent: "center" }}>
                {Array(25).fill(0).map((_, i) => (
                  <div key={i} style={{
                    width: "5px",
                    height: "4px",
                    backgroundColor: "#1e3a5f",
                    borderRadius: "3px",
                  }} />
                ))}
              </div>
              <p style={{ color: "#3a5f8a", margin: 0, fontSize: "13px" }}>
                Click 🎤 to start recording
              </p>
            </div>
          )}
        </div>

        {/* Word count */}
        {(answer || interimText) && (
          <p style={{
            textAlign: "right",
            color: (answer + interimText).split(" ").length < 10 ? "#ff4444" : "#00ff88",
            fontSize: "13px",
            marginBottom: "15px",
          }}>
            {(answer + interimText).split(" ").length < 10
              ? `⚠️ ${(answer + interimText).split(" ").length} words — speak more!`
              : `✅ ${(answer + interimText).split(" ").length} words — good!`}
          </p>
        )}

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={!answer && !interimText}
          style={{
            padding: "14px 35px",
            background: answer || interimText ? "#00bfff" : "#333",
            color: answer || interimText ? "white" : "#666",
            border: "none",
            borderRadius: "8px",
            cursor: answer || interimText ? "pointer" : "not-allowed",
            fontSize: "16px",
            fontWeight: "bold",
            width: "100%",
          }}
        >
          {currentQuestion === questions.length - 1 ? "🏁 Finish Interview" : "Next Question →"}
        </button>

        <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#ffffff08", borderRadius: "8px" }}>
          <p style={{ color: "#666", margin: 0, fontSize: "13px" }}>
            🎤 Click green mic → Speak → Watch REC bar → Click red stop → Click Next
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 20px #ff444466; }
          50% { transform: scale(1.08); box-shadow: 0 0 35px #ff4444aa; }
          100% { transform: scale(1); box-shadow: 0 0 20px #ff444466; }
        }
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        @keyframes waveBar {
          0% { transform: scaleY(0.3); opacity: 0.6; }
          100% { transform: scaleY(1.8); opacity: 1; }
        }
        @keyframes recBlink {
          0% { opacity: 1; }
          50% { opacity: 0.2; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default Interview;
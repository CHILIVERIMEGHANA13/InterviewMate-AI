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
  const [voiceError, setVoiceError] = useState("");

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
    recognition.maxAlternatives = 1;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0]?.transcript || "";
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setAnswer((prev) => (prev + " " + finalTranscript).trim());
      }
      setInterimText(interimTranscript.trim());
    };
    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError("");
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      const message =
        event.error === "not-allowed"
          ? "Microphone permission was denied. Please allow microphone access and try again."
          : event.error === "no-speech"
          ? "No speech detected. Please try speaking louder or closer to the microphone."
          : "Voice recording failed. Please refresh and try again.";
      setVoiceError(message);
    };
    recognition.onend = () => {
      setIsListening(false);
      setInterimText("");
    };
    recognitionRef.current = recognition;
  }, []);

  // ✅ Camera Setup
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera not supported.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraOn(true);
      setCameraError("");
    } catch (err) {
      setCameraError("Camera permission denied.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  };

  // Start the camera preview when the interview view opens.
  useEffect(() => {
    if (showInterview && !cameraOn) {
      startCamera();
    }
  }, [showInterview, cameraOn]);

  // ✅ Cleanup
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // ✅ Start Listening
  const startListening = async () => {
    if (isListening) return;

    if (!recognitionRef.current) {
      setVoiceError("Voice recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    try {
      if (navigator.permissions && navigator.permissions.query) {
        const permission = await navigator.permissions.query({ name: "microphone" });
        if (permission.state === "denied") {
          setVoiceError("Microphone is blocked in this browser session. Please open this page in a real Chrome or Edge browser and allow microphone access.");
          setIsListening(false);
          return;
        }
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      setVoiceError("");
      setAnswer("");
      setInterimText("");
      try {
        recognitionRef.current.abort();
      } catch (error) {
        // Ignore stale recognition state errors.
      }
      recognitionRef.current.start();
    } catch (error) {
      console.error("Microphone permission error:", error);
      setVoiceError("Microphone permission is required for voice recording. Please open this page in Chrome or Edge and allow microphone access, then try again.");
      setIsListening(false);
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
              <p style={{ color: "#aaa", fontSize: "13px", margin: 0 }}>
                One word or no meaningful answer
              </p>
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
              <p style={{ color: "#aaa", fontSize: "13px", margin: 0 }}>
                Basic answer with some knowledge
              </p>
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
              <p style={{ color: "#aaa", fontSize: "13px", margin: 0 }}>
                Clear answer with explanation
              </p>
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
              <p style={{ color: "#aaa", fontSize: "13px", margin: 0 }}>
                Detailed answer with examples
              </p>
            </div>
          </div>

          <div style={{
            backgroundColor: "#ffffff11",
            borderRadius: "10px",
            padding: "20px",
          }}>
            <p style={{
              color: "#00ff88",
              margin: "0 0 12px 0",
              fontWeight: "bold",
              fontSize: "16px",
            }}>
              🎤 How to Use Voice Interview:
            </p>
            <ul style={{
              color: "#ccc",
              margin: 0,
              paddingLeft: "20px",
              fontSize: "14px",
              lineHeight: "2.2",
            }}>
              <li>Click <strong style={{ color: "#00ff88" }}>🎤 green mic button</strong> to start</li>
              <li>Allow microphone and camera permission</li>
              <li>Speak your answer <strong style={{ color: "white" }}>clearly and loudly</strong></li>
              <li>Your speech will appear as text on screen</li>
              <li>Click <strong style={{ color: "#ff4444" }}>🔴 red button</strong> when done speaking</li>
              <li>Click <strong style={{ color: "#00bfff" }}>Next Question →</strong> to continue</li>
              <li>Use <strong style={{ color: "white" }}>Google Chrome</strong> for best results!</li>
            </ul>
          </div>

          <div style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
            gap: "30px",
            flexWrap: "wrap",
          }}>
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

        <div style={{
          backgroundColor: "#111827",
          border: "1px solid #374151",
          borderRadius: "10px",
          padding: "14px 16px",
          width: "65%",
          margin: "0 auto 18px auto",
          color: "#f3f4f6",
          textAlign: "left",
          fontSize: "14px",
        }}>
          ⚠️ Microphone recording works only in a real Chrome or Edge browser tab. The VS Code embedded page cannot ask for microphone permission here.
        </div>

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
            }} />
            <span style={{ color: "white", fontSize: "11px" }}>
              {cameraOn ? "● LIVE" : "○ OFF"}
            </span>
          </div>
          <span style={{ color: "#aaa", fontSize: "11px" }}>📷</span>
        </div>

        {!cameraOn && (
          <button
            onClick={startCamera}
            style={{
              width: "100%",
              padding: "8px 10px",
              backgroundColor: "#00bfff",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            📷 Turn on Camera
          </button>
        )}

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: "100%",
            height: "150px",
            objectFit: "cover",
            display: "block",
          }}
        />

        {cameraError && (
          <div style={{ padding: "8px", backgroundColor: "#ff444422" }}>
            <p style={{ color: "#ff4444", margin: 0, fontSize: "11px" }}>
              {cameraError}
            </p>
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

        <h3 style={{
          color: "#00bfff",
          marginBottom: "30px",
          textAlign: "left",
          fontSize: "20px",
        }}>
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
          {voiceError && (
            <p style={{ color: "#ff9999", marginTop: "8px", fontSize: "13px" }}>
              {voiceError}
            </p>
          )}
        </div>

        {/* ✅ Transcript Box */}
        <div style={{
          backgroundColor: "#2a2a2a",
          borderRadius: "10px",
          padding: "20px",
          minHeight: "120px",
          marginBottom: "20px",
          border: isListening
            ? "2px solid #00ff88"
            : answer
            ? "2px solid #00bfff"
            : "1px solid #444",
          textAlign: "left",
          transition: "all 0.3s ease",
        }}>
          {answer && (
            <p style={{ color: "white", margin: 0, fontSize: "16px" }}>
              {answer}
            </p>
          )}
          {interimText && (
            <p style={{
              color: "#aaa",
              margin: 0,
              fontSize: "16px",
              fontStyle: "italic",
            }}>
              {interimText}
            </p>
          )}
          {!answer && !interimText && (
            <p style={{ color: "#555", margin: 0, fontSize: "15px" }}>
              Your spoken answer will appear here...
            </p>
          )}
        </div>

        {/* Word count */}
        {(answer || interimText) && (
          <p style={{
            textAlign: "right",
            color: (answer + interimText).split(" ").length < 10
              ? "#ff4444"
              : "#00ff88",
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
          {currentQuestion === questions.length - 1
            ? "🏁 Finish Interview"
            : "Next Question →"}
        </button>

        <div style={{
          marginTop: "15px",
          padding: "10px",
          backgroundColor: "#ffffff08",
          borderRadius: "8px",
        }}>
          <p style={{ color: "#666", margin: 0, fontSize: "13px" }}>
            🎤 Click green mic → Speak → Click red stop → Click Next
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
      `}</style>
    </div>
  );
}

export default Interview;
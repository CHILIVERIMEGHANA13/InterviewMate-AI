import { useState, useEffect, useRef } from "react";
import axios from "axios";

function ResumeAnalyzer() {
  const [resumeFile, setResumeFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [resumeResult, setResumeResult] = useState(null);
  const [showTipsPage, setShowTipsPage] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [evaluating, setEvaluating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  // ✅ Voice States
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [interimText, setInterimText] = useState("");

  // ✅ Camera States
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

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
      if (finalTranscript) setAnswer(finalTranscript.trim());
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
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera not supported in this browser.");
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
      console.error("Camera error:", err);
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

  // ✅ Start camera when interview starts
  useEffect(() => {
    if (interviewStarted && !cameraOn) {
      startCamera();
    }
  }, [interviewStarted]);

  // ✅ Cleanup camera on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // ✅ Start Listening
  const startListening = () => {
    if (!recognitionRef.current) return;
    setAnswer("");
    setInterimText("");
    recognitionRef.current.start();
    setIsListening(true);
  };

  // ✅ Stop Listening
  const stopListening = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
    setInterimText("");
  };

  // ✅ Handle Resume Upload
  const handleResumeAnalyze = async () => {
    if (!resumeFile) {
      alert("Please select a PDF file first!");
      return;
    }
    setAnalyzing(true);
    setResumeResult(null);
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      const response = await axios.post(
        "http://localhost:5000/api/resume/analyze",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setResumeResult(response.data);
    } catch (error) {
      console.log("❌ Error:", error);
      alert("Error analyzing resume. Please try again!");
    }
    setAnalyzing(false);
  };

  // ✅ Handle Answer Submission
  const handleNext = async () => {
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

    const questions = resumeResult?.interview_questions || [];

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setEvaluating(true);
      const results = [];
      for (let i = 0; i < questions.length; i++) {
        try {
          const response = await axios.post(
            "http://localhost:5000/api/interview/evaluate",
            {
              question: questions[i],
              answer: updatedAnswers[i] || "No answer provided",
              role: "Resume Based Interview",
            }
          );
          results.push(response.data);
        } catch (error) {
          results.push({
            score: 0,
            feedback: "Could not evaluate this answer",
            correct_answer: "Please try again",
          });
        }
      }
      const total = results.reduce((sum, r) => sum + (r.score || 0), 0);
      const outOf10 = results.length > 0
        ? Math.round(total / results.length)
        : 0;
      setEvaluations(results);
      setTotalScore(outOf10);
      stopCamera();
      setEvaluating(false);
      setShowResults(true);
    }
  };

  const questions = resumeResult?.interview_questions || [];
  const progress = questions.length > 0
    ? (currentQuestion / questions.length) * 100
    : 0;

  // ============================
  // ✅ RESULTS PAGE
  // ============================
  if (showResults) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "black",
        color: "white",
        padding: "40px",
      }}>
        <h1 style={{ textAlign: "center", marginBottom: "10px" }}>
          Interview Results 🎉
        </h1>
        <p style={{
          textAlign: "center",
          color: "#00bfff",
          fontSize: "18px",
          marginBottom: "40px",
        }}>
          Resume Based Interview
        </p>

        {questions.map((question, index) => (
          <div key={index} style={{
            backgroundColor: "#1e1e1e",
            padding: "25px",
            margin: "20px auto",
            width: "70%",
            borderRadius: "10px",
            borderLeft: evaluations[index]?.score >= 5
              ? "4px solid #00ff88"
              : "4px solid #ff4444",
          }}>
            <h2>Question {index + 1}</h2>
            <p><strong style={{ color: "#00bfff" }}>Question:</strong></p>
            <p>{question}</p>
            <p><strong style={{ color: "#00bfff" }}>Your Answer:</strong></p>
            <p style={{ color: "#fff" }}>
              {answers[index] || "❌ No Answer Provided"}
            </p>
            <p>
              <strong style={{ color: "#00bfff" }}>AI Score: </strong>
              <span style={{
                color: evaluations[index]?.score >= 7
                  ? "#00ff88"
                  : evaluations[index]?.score >= 4
                  ? "#ffaa00"
                  : "#ff4444",
                fontWeight: "bold",
                fontSize: "18px",
              }}>
                {evaluations[index]?.score ?? 0} / 10
              </span>
            </p>
            <p><strong style={{ color: "#00bfff" }}>AI Feedback:</strong></p>
            <p style={{ color: "#ccc" }}>{evaluations[index]?.feedback}</p>
            <p><strong style={{ color: "#00bfff" }}>Correct Answer:</strong></p>
            <p style={{ color: "#aaffaa" }}>{evaluations[index]?.correct_answer}</p>
          </div>
        ))}

        <div style={{
          textAlign: "center",
          backgroundColor: "#1e1e1e",
          padding: "30px",
          borderRadius: "15px",
          width: "40%",
          margin: "40px auto",
        }}>
          <h2>Your Total Score</h2>
          <h1 style={{
            fontSize: "60px",
            color: totalScore >= 8
              ? "#00ff88"
              : totalScore >= 5
              ? "#ffaa00"
              : "#ff4444",
          }}>
            {totalScore} / 10
          </h1>
          <p style={{ color: "#aaa", fontSize: "14px", marginBottom: "10px" }}>
            Average score across {questions.length} questions
          </p>
          <p style={{
            fontSize: "18px",
            color: totalScore >= 8
              ? "#00ff88"
              : totalScore >= 5
              ? "#ffaa00"
              : "#ff4444",
          }}>
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
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ============================
  // ✅ EVALUATING SCREEN
  // ============================
  if (evaluating) {
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
        <h2>🤖 AI is evaluating your answers...</h2>
        <p style={{ color: "#aaa" }}>Please wait a moment</p>
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

  // ============================
  // ✅ TIPS PAGE
  // ============================
  if (showTipsPage && !interviewStarted) {
    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: "black",
        color: "white",
        padding: "40px",
        textAlign: "center",
      }}>
        <h1 style={{ marginBottom: "5px" }}>📄 Resume Based Interview</h1>
        <p style={{ color: "#aaa", marginBottom: "30px" }}>
          This is a Voice-Only interview! Speak your answers clearly.
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
            💡 How AI Scores Your Answers
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
                Detailed answer with real examples
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
              <li>Click <strong style={{ color: "#00ff88" }}>🎤 Start Speaking</strong> button</li>
              <li>Allow microphone and camera permission</li>
              <li>Speak your answer <strong style={{ color: "white" }}>clearly and loudly</strong></li>
              <li>Your speech will appear as text on screen</li>
              <li>Click <strong style={{ color: "#ff4444" }}>🔴 Stop</strong> when done speaking</li>
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
              <h2 style={{ color: "#ffaa00", margin: 0 }}>📄</h2>
              <p style={{ color: "#aaa", margin: 0, fontSize: "14px" }}>Resume Based</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ color: "#00ff88", margin: 0 }}>🎤</h2>
              <p style={{ color: "#aaa", margin: 0, fontSize: "14px" }}>Voice + Camera</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setInterviewStarted(true)}
          style={{
            padding: "15px 40px",
            backgroundColor: "#00ff88",
            color: "black",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "15px",
          }}
        >
          🚀 Start Resume Interview
        </button>

        <br />

        <button
          onClick={() => setShowTipsPage(false)}
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
          ← Back to Resume Analysis
        </button>
      </div>
    );
  }

  // ============================
  // ✅ INTERVIEW PAGE
  // ============================
  if (interviewStarted) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "black",
        color: "white",
        padding: "40px",
        textAlign: "center",
        position: "relative",
      }}>

        {/* ✅ Camera Preview - Top Right Fixed */}
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
          {/* Camera Status Bar */}
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

          {/* Video Feed */}
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

        <h1 style={{ marginBottom: "5px" }}>🎤 Resume Voice Interview</h1>

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
              backgroundColor: "#00bfff",
              color: "black",
              padding: "4px 12px",
              borderRadius: "20px",
              fontWeight: "bold",
              fontSize: "14px",
            }}>
              Resume Based
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
              {isListening
                ? "🎤 Listening... Speak now!"
                : "Click mic to start speaking"}
            </p>
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

  // ============================
  // ✅ UPLOAD PAGE
  // ============================
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "black",
      color: "white",
      padding: "40px",
    }}>
      {!resumeResult && (
        <>
          <h1 style={{ textAlign: "center", marginBottom: "10px" }}>
            📄 Resume Analyzer
          </h1>
          <p style={{
            textAlign: "center",
            color: "#aaa",
            marginBottom: "40px",
            fontSize: "16px",
          }}>
            Upload your resume and get AI-powered analysis + personalized interview questions!
          </p>
        </>
      )}

      {resumeResult && (
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
          📄 Resume Analysis Results
        </h1>
      )}

      {resumeResult && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <button
            onClick={() => {
              setResumeResult(null);
              setResumeFile(null);
            }}
            style={{
              padding: "8px 20px",
              backgroundColor: "#1e1e1e",
              color: "#aaa",
              border: "1px solid #444",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            🔄 Analyze Another Resume
          </button>
        </div>
      )}

      {!resumeResult && (
        <div style={{
          backgroundColor: "#1e1e1e",
          borderRadius: "15px",
          padding: "35px",
          margin: "0 auto",
          width: "60%",
          textAlign: "center",
          borderTop: "4px solid #00bfff",
        }}>
          <h2 style={{ marginBottom: "20px" }}>📂 Upload Your Resume</h2>

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setResumeFile(e.target.files[0])}
            style={{
              color: "white",
              display: "block",
              margin: "0 auto 20px auto",
            }}
          />

          {resumeFile && (
            <p style={{ color: "#00ff88", marginBottom: "15px" }}>
              ✅ File selected: {resumeFile.name}
            </p>
          )}

          <button
            onClick={handleResumeAnalyze}
            disabled={analyzing}
            style={{
              padding: "12px 30px",
              backgroundColor: analyzing ? "#555" : "#00bfff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: analyzing ? "not-allowed" : "pointer",
              fontSize: "16px",
            }}
          >
            {analyzing ? "🤖 Analyzing Resume..." : "🔍 Analyze Resume"}
          </button>
        </div>
      )}

      {resumeResult && (
        <div style={{
          backgroundColor: "#1e1e1e",
          borderRadius: "15px",
          padding: "35px",
          margin: "0 auto",
          width: "60%",
        }}>
          {/* Skills */}
          <div style={{ marginBottom: "25px" }}>
            <h3 style={{ color: "#00bfff", marginBottom: "12px" }}>✅ Skills Found</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {resumeResult.skills?.map((skill, i) => (
                <span key={i} style={{
                  backgroundColor: "#00bfff22",
                  color: "#00bfff",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  border: "1px solid #00bfff",
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div style={{ marginBottom: "25px" }}>
            <h3 style={{ color: "#00bfff", marginBottom: "12px" }}>💼 Experience</h3>
            <p style={{ color: "#ccc" }}>{resumeResult.experience}</p>
          </div>

          {/* Projects */}
          <div style={{ marginBottom: "25px" }}>
            <h3 style={{ color: "#00bfff", marginBottom: "12px" }}>🚀 Projects</h3>
            <ul style={{ color: "#ccc", paddingLeft: "20px" }}>
              {resumeResult.projects?.map((project, i) => (
                <li key={i} style={{ marginBottom: "5px" }}>{project}</li>
              ))}
            </ul>
          </div>

          {/* Missing Skills */}
          <div style={{ marginBottom: "25px" }}>
            <h3 style={{ color: "#ff4444", marginBottom: "12px" }}>⚠️ Missing Skills</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {resumeResult.missing_skills?.map((skill, i) => (
                <span key={i} style={{
                  backgroundColor: "#ff444422",
                  color: "#ff4444",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  border: "1px solid #ff4444",
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div style={{ marginBottom: "25px" }}>
            <h3 style={{ color: "#ffaa00", marginBottom: "12px" }}>💡 AI Suggestions</h3>
            <p style={{ color: "#ccc" }}>{resumeResult.suggestions}</p>
          </div>

          {/* Interview Questions */}
          <div style={{ marginBottom: "25px" }}>
            <h3 style={{ color: "#00ff88", marginBottom: "12px" }}>
              🎯 Personalized Interview Questions ({questions.length})
            </h3>
            <ol style={{ color: "#ccc", paddingLeft: "20px" }}>
              {resumeResult.interview_questions?.map((q, i) => (
                <li key={i} style={{ marginBottom: "8px" }}>{q}</li>
              ))}
            </ol>
          </div>

          {/* Start Interview Button */}
          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => setShowTipsPage(true)}
              style={{
                padding: "14px 35px",
                backgroundColor: "#00ff88",
                color: "black",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              🚀 Start Resume Interview ({questions.length} Questions)
            </button>
          </div>
        </div>
      )}

      {!resumeResult && (
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button
            onClick={() => (window.location.href = "/dashboard")}
            style={{
              padding: "12px 25px",
              backgroundColor: "#1e1e1e",
              color: "#00bfff",
              border: "2px solid #00bfff",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

export default ResumeAnalyzer;
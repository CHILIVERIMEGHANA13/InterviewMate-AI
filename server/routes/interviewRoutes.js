require("dotenv").config();

const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const Result = require("../models/Result");

// ✅ Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ✅ Test Route
router.get("/", (req, res) => {
  res.send("Interview Routes Working ✅");
});

// ✅ Evaluate Answer Route
router.post("/evaluate", async (req, res) => {
  try {
    const { question, answer, role } = req.body;

    console.log(`📝 Evaluating: ${question?.substring(0, 30)}...`);

    const prompt = `
      You are an expert ${role} interviewer.
      
      Question: ${question}
      Candidate's Answer: ${answer}
      
      Evaluate the answer and respond in JSON format only.
      No extra text, no markdown, just pure JSON:
      {
        "score": <number between 0 to 10>,
        "feedback": "<short feedback in 1-2 lines>",
        "correct_answer": "<ideal answer in 2-3 lines>"
      }
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = response.choices[0].message.content;
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleaned);

    console.log("✅ Evaluation done! Score:", result.score);

    res.status(200).json(result);
  } catch (error) {
    console.log("❌ Groq Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Save Result Route
router.post("/save-result", async (req, res) => {
  try {
    const { userId, userName, role, score, totalQuestions, evaluations } =
      req.body;

    const newResult = new Result({
      userId,
      userName,
      role,
      score,
      totalQuestions,
      evaluations,
    });

    await newResult.save();

    res.status(201).json({
      message: "Result saved successfully!",
    });
  } catch (error) {
    console.log("Save Result Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get All Results for a User
router.get("/results/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const results = await Result.find({ userId }).sort({ date: -1 });
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
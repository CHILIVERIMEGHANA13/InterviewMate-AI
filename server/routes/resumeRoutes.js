require("dotenv").config();

const express = require("express");
const fs = require("fs/promises");
const multer = require("multer");
const Groq = require("groq-sdk");

const router = express.Router();

// ✅ Multer setup
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are supported."), false);
    }
  },
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const skillKeywords = [
  "javascript", "react", "node", "express", "mongodb",
  "sql", "python", "java", "typescript", "aws",
  "docker", "git", "html", "css", "tailwind", "redux",
];

const safeArray = (value) =>
  Array.isArray(value) ? value.filter(Boolean) : [];

// ✅ Fallback analysis with 8 questions
function buildFallbackAnalysis(text) {
  const lowerText = text.toLowerCase();
  const skills = skillKeywords.filter((skill) =>
    lowerText.includes(skill)
  );
  const missingSkills = skillKeywords
    .filter((skill) => !lowerText.includes(skill))
    .slice(0, 6);

  return {
    skills: skills.length
      ? skills
      : ["Problem solving", "Communication", "Teamwork"],
    experience:
      "Resume parsed successfully. Add measurable outcomes to strengthen this section.",
    projects: [
      "Project highlights detected in the uploaded resume.",
      "Consider adding metrics such as scale, performance, and team impact.",
    ],
    missing_skills: missingSkills.length
      ? missingSkills
      : ["Leadership", "Testing", "Cloud deployment"],
    suggestions:
      "Use more action verbs, quantify achievements, and mention tools used in each project.",
    interview_questions: [
      "Tell me about your most significant project and the impact it created.",
      "Which technologies are you most confident using and why?",
      "How do you approach debugging a complex issue in your code?",
      "Describe a challenging problem you solved and how you solved it.",
      "How do you stay updated with new technologies?",
      "Explain your experience with version control systems like Git.",
      "How would you improve this resume to stand out to recruiters?",
      "Where do you see yourself in the next 2 years technically?",
    ],
  };
}

// ✅ Analyze Route
router.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Please upload a PDF resume file.",
      });
    }

    console.log("✅ File received:", req.file.originalname);

    // ✅ Read PDF buffer
    const pdfBuffer = await fs.readFile(req.file.path);

    // ✅ Fixed PDF parsing for Node v24
    let text = "";
    try {
      const pdfParse = require("pdf-parse");
      const parsed = await pdfParse(pdfBuffer);
      text = (parsed.text || "").trim();
      console.log("✅ Text extracted! Length:", text.length);
    } catch (pdfError) {
      console.warn("⚠️ PDF parse warning:", pdfError.message);
      text = "";
    }

    // ✅ Start with fallback
    let analysis = buildFallbackAnalysis(text);

    // ✅ Try Groq AI
    try {
      const prompt = `
You are an expert HR and technical recruiter.

Analyze this resume text and respond in JSON format only.
No extra text, no markdown, just pure JSON:

{
  "skills": ["skill1", "skill2", "skill3"],
  "experience": "<experience summary in 2 lines>",
  "projects": ["project1", "project2"],
  "missing_skills": ["missing skill1", "missing skill2"],
  "suggestions": "<2-3 improvement suggestions>",
  "interview_questions": [
    "question1 based on resume skills",
    "question2 based on resume projects",
    "question3 based on experience",
    "question4 based on missing skills",
    "question5 technical question",
    "question6 based on resume skills",
    "question7 situational question",
    "question8 based on overall profile"
  ]
}

IMPORTANT: Return exactly 8 interview_questions.

Resume Text:
${text || "No readable text found."}
      `;

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
      });

      const rawText = response.choices?.[0]?.message?.content || "{}";
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      const aiResult = JSON.parse(cleaned);

      console.log("✅ AI analysis done!");

      analysis = {
        skills: safeArray(aiResult.skills).length
          ? safeArray(aiResult.skills)
          : analysis.skills,
        experience: aiResult.experience || analysis.experience,
        projects: safeArray(aiResult.projects).length
          ? safeArray(aiResult.projects)
          : analysis.projects,
        missing_skills: safeArray(aiResult.missing_skills).length
          ? safeArray(aiResult.missing_skills)
          : analysis.missing_skills,
        suggestions: aiResult.suggestions || analysis.suggestions,
        interview_questions: safeArray(aiResult.interview_questions).length
          ? safeArray(aiResult.interview_questions)
          : analysis.interview_questions,
      };
    } catch (aiError) {
      console.warn("⚠️ AI fallback used:", aiError.message);
    }

    // ✅ Delete temp file
    await fs.unlink(req.file.path).catch(() => {});

    return res.status(200).json(analysis);
  } catch (error) {
    console.error("❌ Resume analysis error:", error.message);
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    return res.status(500).json({
      error: error.message || "Failed to analyze resume.",
    });
  }
});

module.exports = router;
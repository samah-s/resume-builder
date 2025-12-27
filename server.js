import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview"
});

app.post("/parse-resume", async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: "resumeText missing" });
    }

    const prompt = `
You are an expert technical recruiter.

Extract information STRICTLY for IT / Software Engineering resumes.

Return ONLY VALID JSON (no markdown, no explanation).

Schema:
{
  "name": "",
  "email": "",
  "phone": "",
  "linkedin": "",
  "github": "",
  "education": [
    {
      "institution": "",
      "degree": "",
      "duration": "",
      "gpa": ""
    }
  ],
  "experience": [
    {
      "company": "",
      "position": "",
      "duration": "",
      "location": "",
      "bullets": [
        "Impact-driven bullet points with metrics"
      ]
    }
  ],
  "projects": [
    {
      "name": "",
      "tech": "",
      "bullets": [
        "Clear technical contribution bullets"
      ],
      "link": ""
    }
  ],
  "skills": {
    "languages": [],
    "frameworks": [],
    "tools": [],
    "libraries": []
  }
}

Resume Text:
"""
${resumeText}
"""
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    res.json(parsed);

  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({
      error: "Gemini parsing failed"
    });
  }
});

app.listen(3001, () => {
  console.log("✓ Gemini resume parser running on http://localhost:3001");
});

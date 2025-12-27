import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: "resumeText missing" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview"
    });

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

    res.status(200).json(parsed);

  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({
      error: "Gemini parsing failed"
    });
  }
}

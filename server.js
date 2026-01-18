import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Serve the main public folder
app.use(express.static(path.join(__dirname, "public")));

// Serve the quizpage folder
app.use("/quizpage", express.static(path.join(__dirname, "quizpage")));

/* ============================== */
/* >>> OPENROUTER API KEY <<< */
const OPENROUTER_API_KEY = process.env.DEEPSEEK_API_KEY;
/* ============================== */

// ===============================
// Generate Questions API
// ===============================
app.post("/api/generate-questions", async (req, res) => {
  try {
    const topic = (req.body?.topic || "").trim();

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Missing "topic"',
      });
    }

    const endpoint = "https://openrouter.ai/api/v1/chat/completions";

    const prompt = `
You are generating interview-style questions.

RULES:
- Generate EXACTLY 10 interview questions
- One sentence each
- Moderate difficulty
- Definitions and MCQs only
- NO answers
- NO explanations
- NO markdown
- Output STRICT JSON ONLY

FORMAT:
[
  {"id":1,"question":"..."},
  ...
  {"id":10,"question":"..."}
]

TOPIC: "${topic}"
`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "InterroAI",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 700,
      }),
    });

    const rawText = await response.text();

    if (!response.ok) {
      return res.json({
        success: false,
        error: "OpenRouter API HTTP " + response.status,
        raw: rawText,
      });
    }

    const data = JSON.parse(rawText);
    let jsonText = data?.choices?.[0]?.message?.content;

    if (!jsonText) {
      return res.json({
        success: false,
        error: "No content returned",
        raw: data,
      });
    }

    jsonText = jsonText.replace(/^```json|```$/gm, "").trim();

    let questions;
    try {
      questions = JSON.parse(jsonText);
    } catch {
      return res.json({
        success: false,
        error: "JSON parse failed",
        rawText: jsonText,
      });
    }

    const clean = [];
    let id = 1;

    for (const q of questions) {
      if (!q?.question) continue;
      clean.push({ id: id++, question: q.question.trim() });
      if (clean.length === 10) break;
    }

    while (clean.length < 10) {
      const n = clean.length + 1;
      clean.push({
        id: n,
        question: `Explain a basic concept related to ${topic} (Q${n}).`,
      });
    }

    res.json({ success: true, questions: clean });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ===============================
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});

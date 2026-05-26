import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for base64 file uploads (PDF / Audio)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in the Secrets panel. Please set your key there.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Endpoint: Check API Key status or general health
app.get("/api/health", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: "ok",
    apiKeyConfigured: hasKey,
    timestamp: new Date().toISOString()
  });
});

// Endpoint: Generate structured notes from uploaded PDF/Audio
app.post("/api/generate-notes", async (req, res) => {
  try {
    const { base64Data, mimeType, fileName } = req.body;
    if (!base64Data || !mimeType) {
      return res.status(400).json({ error: "Missing file base64 data or media mime type." });
    }

    const ai = getGeminiClient();
    const mediaPart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };

    const promptText = `Analyze the uploaded material: "${fileName || 'study-document'}". 
Extract all information and synthesize it into comprehensive, clean, and beautifully structured study notes.
The study notes must satisfy:
1. Title: Create a high-quality educational title summarizing the document's core subject.
2. Summary: A detailed 2-to-3 sentence abstract that hooks the reader.
3. Notes Markdown: Rich, deeply descriptive study notes utilizing proper Markdown hierarchies (##, ###). Include bulleted points, highlighted keywords using bold/italic styling, numbered lists, key diagrams/formulas explained, and styled text chunks. Make sure it reads professionally and does not skip details. Use examples from the material to make concepts relatable.
4. Key Concepts: Extract 4 to 8 fundamental terms, formulas, or concepts and give their precise definitions for rapid self-assessment.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [mediaPart, { text: promptText }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A high-quality educational and engaging title for these notes." },
            summary: { type: Type.STRING, description: "A concise, academic 2-to-3 sentence summarization." },
            notesMarkdown: { type: Type.STRING, description: "Comprehensive study notes structured beautifully with markdown titles, subtitles, lists, and highlighting." },
            keyConcepts: {
              type: Type.ARRAY,
              description: "Array of essential key study terms/concepts pairing names with clear concise explanations.",
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING, description: "The term, keyword, formula, or concept name." },
                  definition: { type: Type.STRING, description: "The precise meaning, utility, or explanation." }
                },
                required: ["term", "definition"]
              }
            }
          },
          required: ["title", "summary", "notesMarkdown", "keyConcepts"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from the Gemini model.");
    }

    const parsedResponse = JSON.parse(text.trim());
    return res.json(parsedResponse);
  } catch (error: any) {
    console.error("Error in /api/generate-notes:", error);
    // Return structured error to UI
    return res.status(500).json({
      error: error.message || "An error occurred during Gemini file processing.",
      code: error.code || "UNKNOWN_ERROR"
    });
  }
});

// Endpoint: Generate interactive Quiz based on Notes
app.post("/api/generate-quiz", async (req, res) => {
  try {
    const { title, notesMarkdown, keyConcepts } = req.body;
    if (!notesMarkdown) {
      return res.status(400).json({ error: "Missing study notes markdown to base quiz on." });
    }

    const ai = getGeminiClient();
    const promptText = `Based on the following study notes and core concepts, generate an interactive multiple choice quiz to test active recall and deep comprehension about "${title || 'the study notes'}".

Study Notes:
${notesMarkdown}

Key Concepts:
${JSON.stringify(keyConcepts || [])}

Instructions:
1. Generate exactly 5-8 questions.
2. Each question must test comprehension (applying concepts, understanding core mechanisms, testing formulas, or clarifying errors) rather than trivial terminology.
3. Every question must have exactly 4 plausible options.
4. Set 'correctAnswer' to the exact match of one of the 4 elements in 'options' array.
5. Provide a helpful, kind 'explanation' that explains why the answer is correct and briefly addresses misconceptions.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "An array of challenging multiple-choice quiz questions.",
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Unique letter/number index like 'q1', 'q2'..." },
              question: { type: Type.STRING, description: "The question statement. Keep it testing-focused." },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exactly 4 options representing possible answers. Ensure all are plausible but only one is 100% accurate."
              },
              correctAnswer: { type: Type.STRING, description: "The correct option. Must match one of the string elements in the 'options' array exactly." },
              explanation: { type: Type.STRING, description: "A high-quality educational explanation of why the correct option is right and others are incorrect." }
            },
            required: ["id", "question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from the Gemini model while generating the quiz.");
    }

    const parsedQuiz = JSON.parse(text.trim());
    return res.json(parsedQuiz);
  } catch (error: any) {
    console.error("Error in /api/generate-quiz:", error);
    return res.status(500).json({
      error: error.message || "An error occurred while synthesizing the quiz."
    });
  }
});

// Start integration server
async function init() {
  // Vite dev server middleware integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    // Production builds
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Static files served from dist/ folder.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express full-stack server running on http://localhost:${PORT}`);
  });
}

init().catch((err) => {
  console.error("Server initialization crashed:", err);
});

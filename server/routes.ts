import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { registerAudioRoutes } from "./replit_integrations/audio";
import multer from "multer";
import { createWorker } from "tesseract.js";
import { openai } from "./replit_integrations/image/index"; // Reuse openai instance
import { decodedResultSchema } from "@shared/schema";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);
  
  // Register Integrations
  registerChatRoutes(app);
  registerImageRoutes(app);
  registerAudioRoutes(app);

  // Decode API
  app.post("/api/decode", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const language = req.body.language || "English";
      const buffer = req.file.buffer;

      // 1. OCR with Tesseract.js
      // We use 'eng' as default, but could map language names to tesseract codes
      const worker = await createWorker("eng"); 
      const ret = await worker.recognize(buffer);
      const text = ret.data.text;
      await worker.terminate();

      if (!text || text.trim().length === 0) {
        return res.status(400).json({ message: "Could not extract text from document." });
      }

      // 2. LLM Decode
      // We use the OpenAI integration to structure the data
      const prompt = `
        You are a legal document assistant. 
        Analyze the following legal document text (OCR output) and structure it.
        The user's preferred language is: ${language}.
        
        Translate the Summary, Key Points, and Action Plan into ${language}.
        Keep the 'extractedFields' in the original language of the document (usually English or local), unless translation is strictly better.
        
        Output valid JSON matching this schema:
        {
          "docType": "Legal Notice" | "Court Order" | "Agreement" | "Other",
          "category": "Property" | "Finance" | "Family" | "Criminal" | "Other",
          "urgency": "Low" | "Medium" | "High",
          "extractedFields": {
            "sender": "string | null",
            "receiver": "string | null",
            "date": "string | null",
            "deadline": "string | null",
            "subject": "string | null",
            "demands": ["string"]
          },
          "summary": "5-7 lines summary in ${language}",
          "keyPoints": ["6-10 bullet points in ${language}"],
          "actionPlan": "Consult a lawyer.", 
          "originalText": "The full OCR text passed in"
        }

        Input Text:
        ${text.substring(0, 15000)} // Truncate to avoid token limits if extremely large
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          { role: "system", content: "You are a helpful legal assistant. Output only valid JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      });

      const jsonStr = response.choices[0].message.content;
      if (!jsonStr) {
        throw new Error("Empty response from LLM");
      }

      const result = JSON.parse(jsonStr);
      
      // Ensure originalText is present (if LLM missed it, inject it)
      if (!result.originalText) {
        result.originalText = text;
      }
      
      // Force action plan to be static
      result.actionPlan = "Consult a lawyer.";

      res.json(result);

    } catch (error: any) {
      console.error("Decode error:", error);
      res.status(500).json({ message: error.message || "Failed to decode document" });
    }
  });

  return httpServer;
}

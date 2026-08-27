import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to safely fetch JSON
  const safeFetchJSON = async (url: string, fallback: any) => {
    try {
      const response = await fetch(url);
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error(`Invalid JSON from ${url}:`, text.substring(0, 100));
        return fallback;
      }
    } catch (error) {
      console.error(`Network error for ${url}:`, error);
      return fallback;
    }
  };

  // API route to proxy BNPB ArcGIS requests
  app.get("/api/bnpb-disasters", async (req, res) => {
    const data = await safeFetchJSON(
      "https://gis.bnpb.go.id/server/rest/services/Kejadian_Bencana_Mingguan/FeatureServer/25/query?where=1=1&outFields=*&returnGeometry=true&f=pjson",
      { features: [] }
    );
    res.json(data);
  });

  // API route to proxy BMKG requests
  app.get("/api/bmkg-terkini", async (req, res) => {
    const data = await safeFetchJSON(
      "https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json",
      { Infogempa: { gempa: [] } }
    );
    res.json(data);
  });

  // API route to proxy PetaBencana requests
  app.get("/api/petabencana-reports", async (req, res) => {
    const data = await safeFetchJSON(
      "https://data.petabencana.id/reports",
      { result: { objects: { output: { geometries: [] } } } }
    );
    res.json(data);
  });

  app.post("/api/sitrep", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.json({ sitrep: "- API Key missing.\n- Cannot generate SitRep.\n- Proceed with default protocols." });
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const { type, name, severity, population, requirements } = req.body;
      const prompt = `You are a tactical logistics AI for a national disaster response team.
Generate a concise, 3-bullet Tactical SitRep (Situation Report) outlining expected infrastructure damage, accessibility risks, and priority actions tailored to this event.
Event Type: ${type}
Name/Location: ${name}
Severity Level: ${severity}/5
Affected Population: ${population}

Provide ONLY 3 bullet points, each starting with a hyphen. Keep the tone clinical, professional, and military-grade (aerospace/command center style). Do not include any intro or outro text. Use clear, actionable language.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt
      });
      
      res.json({ sitrep: response.text });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to generate SitRep" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "Meu Advogado", timestamp: new Date().toISOString() });
  });

  app.post("/api/ai/legal-analyze", async (req, res) => {
    const { processTitle, description } = req.body ?? {};

    if (!processTitle || !description) {
      return res.status(400).json({
        error: "Informe o título e a descrição da demanda para realizar a análise."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: "A análise jurídica por IA está temporariamente indisponível. Configure GEMINI_API_KEY no servidor."
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const promptText = `Você é um assistente de análise jurídica para profissionais do Direito brasileiro. Faça uma análise técnica preliminar, sem substituir aconselhamento jurídico profissional e sem afirmar certeza sobre o resultado de um processo.

Demanda: ${processTitle}
Fatos: ${description}

Responda ESTRITAMENTE em JSON com:
- summary: string
- suggestedStrategy: string
- estimatedSuccessRate: string (deve informar que não é possível estimar probabilidades confiáveis apenas com os dados fornecidos; não invente percentual)
- recommendedMilestones: array de { title: string, description: string, estDays: number }`;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptText,
        config: { responseMimeType: "application/json" }
      });

      const responseText = aiResponse.text;
      if (!responseText) {
        return res.status(502).json({ error: "O provedor de IA não retornou uma análise." });
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        return res.status(502).json({ error: "O provedor de IA retornou uma resposta inválida." });
      }

      return res.json(parsed);
    } catch (error) {
      console.error("Erro na análise IA:", error);
      return res.status(502).json({
        error: "Não foi possível concluir a análise por IA. Tente novamente mais tarde."
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Meu Advogado server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Falha ao iniciar o servidor:", error);
  process.exit(1);
});

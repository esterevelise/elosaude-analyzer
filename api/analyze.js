import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.static(join(__dirname, "../public")));

// Tabela de valores ideais EloSaúde
const IDEAL_VALUES = {
  "vitamina d (25ohd3)": { min: 50, max: 150, unit: "ng/mL" },
  ferritina: { min: 100, max: 130, unit: "ng/mL" },
  pth: { min: 15, max: 65, unit: "pg/mL" },
  "vitamina b12": { min: 500, max: 1200, unit: "pg/mL" },
  homocisteína: { min: 0, max: 10, unit: "µmol/L" },
  magnésio: { min: 2.2, max: 2.6, unit: "mEq/L" },
  zinco: { min: 100, max: 150, unit: "µg/dL" },
  "vitamina a": { min: 30, max: 100, unit: "µg/dL" },
  hemoglobina: { min: 13.5, max: 15.5, unit: "g/dL" },
  "ácido metilmalônico": { min: 0, max: 0.4, unit: "µmol/L" },
  pcr: { min: 0, max: 3, unit: "mg/L" },
  ferro: { min: 60, max: 170, unit: "µg/dL" },
};

function classifyResult(value, idealRange) {
  const minIdeal = idealRange.min;
  const maxIdeal = idealRange.max;

  // Metais pesados e marcadores tumorais
  if (minIdeal === 0 && maxIdeal === 0) {
    return value > 0 ? "🔴 CRÍTICO" : "🟢 NORMAL";
  }

  // Fora dos limites
  if (value <= minIdeal * 0.7 || value >= maxIdeal * 1.3) {
    return "🔴 CRÍTICO";
  }

  // Atenção moderada
  if (
    (value > minIdeal * 0.7 && value < minIdeal * 0.99) ||
    (value > maxIdeal * 1.01 && value < maxIdeal * 1.29)
  ) {
    return "🟠 ATENÇÃO MODERADA";
  }

  // Limítrofe
  if (
    (value >= minIdeal * 0.9 && value <= minIdeal * 0.99) ||
    (value >= maxIdeal * 1.01 && value <= maxIdeal * 1.1)
  ) {
    return "🟡 LIMÍTROFE";
  }

  // Normal
  return "🟢 NORMAL";
}

async function analyzeExam(pdfBase64, patientName = "Paciente") {
  // Criar cliente AQUI dentro da função, não no global
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const systemPrompt = `Você é Claude, assistente de análise laboratorial da EloSaúde.

PROTOCOLO OBRIGATÓRIO:
1. Extraia APENAS os valores numéricos dos resultados do PDF
2. Ignore COMPLETAMENTE os valores de referência do laboratório
3. Compare EXCLUSIVAMENTE com a tabela de valores ideais EloSaúde fornecida
4. Responda SEMPRE em JSON estruturado

FORMATO DE RESPOSTA (JSON válido):
{
  "exames": [
    {
      "nome": "Nome do Exame",
      "resultado": número,
      "unidade": "unidade"
    }
  ],
  "resumo_paciente": "Resumo em linguagem acessível",
  "alertas_clinicos": ["Alerta 1", "Alerta 2"]
}`;

  const message = await client.messages.create({
    model: "claude-opus-4-20250805",
    max_tokens: 2000,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: pdfBase64,
            },
          },
          {
            type: "text",
            text: `Analise este PDF de exame laboratorial. Extraia todos os valores de resultado encontrados e retorne em JSON.`,
          },
        ],
      },
    ],
  });

  // Parse resposta
  let analysisData = { exames: [], resumo_paciente: "", alertas_clinicos: [] };

  const responseText = message.content[0].text;
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);

  if (jsonMatch) {
    try {
      analysisData = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error("Erro parsing JSON:", e);
    }
  }

  // Processar resultados com classificação
  const resultsWithClassification = analysisData.exames.map((exam) => {
    const idealKey = exam.nome.toLowerCase();
    const ideal =
      IDEAL_VALUES[idealKey] ||
      IDEAL_VALUES[Object.keys(IDEAL_VALUES).find((k) =>
        idealKey.includes(k.split("(")[0].trim())
      )];

    return {
      nome: exam.nome,
      resultado: exam.resultado,
      unidade: exam.unidade || ideal?.unit || "",
      minIdeal: ideal?.min || "N/A",
      maxIdeal: ideal?.max || "N/A",
      criticidade: ideal
        ? classifyResult(exam.resultado, ideal)
        : "⚪ NÃO MAPEADO",
    };
  });

  return {
    patientName,
    results: resultsWithClassification,
    summary: analysisData.resumo_paciente,
    alerts: analysisData.alertas_clinicos,
    analysisDate: new Date().toLocaleDateString("pt-BR"),
  };
}

app.post("/api/analyze", async (req, res) => {
  try {
    const { pdfBase64, patientName } = req.body;

    if (!pdfBase64) {
      return res.status(400).json({ error: "PDF não fornecido" });
    }

    const analysis = await analyzeExam(pdfBase64, patientName || "Paciente");
    res.json(analysis);
  } catch (error) {
    console.error("Erro na análise:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});

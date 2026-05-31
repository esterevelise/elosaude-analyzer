import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors({
  origin: '*'
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.static(join(__dirname, '../public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../public/index.html'));
});

function generateHTMLReport(patientName, analysisText) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resultado de Exame - EloSaúde</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @media print {
      body { margin: 0; padding: 0; background: white; }
      .no-print { display: none; }
      .page { box-shadow: none; margin: 0; }
    }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }

    .page {
      width: 210mm;
      height: 297mm;
      margin: 0 auto 20px;
      background: white;
      padding: 20mm;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #333;
      padding-bottom: 15px;
    }

    .header h1 {
      font-size: 24px;
      color: #333;
      margin-bottom: 5px;
    }

    .header p {
      color: #666;
      font-size: 12px;
    }

    .patient-section {
      margin-bottom: 20px;
      padding: 15px;
      background: #f9f9f9;
      border-left: 3px solid #667eea;
    }

    .patient-section h3 {
      font-size: 14px;
      color: #333;
      margin-bottom: 10px;
      font-weight: 600;
    }

    .patient-info {
      font-size: 12px;
      line-height: 1.6;
    }

    .patient-info p {
      margin: 5px 0;
    }

    .patient-info strong {
      color: #333;
    }

    .analysis-section {
      margin-bottom: 20px;
    }

    .analysis-section h3 {
      font-size: 14px;
      color: #333;
      margin-bottom: 10px;
      font-weight: 600;
      border-bottom: 2px solid #667eea;
      padding-bottom: 5px;
    }

    .analysis-content {
      font-size: 12px;
      color: #666;
      line-height: 1.6;
      white-space: pre-wrap;
      background: #f9f9f9;
      padding: 15px;
      border-radius: 6px;
    }

    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 10px;
      color: #999;
      border-top: 1px solid #ddd;
      padding-top: 15px;
    }

    .print-button {
      display: block;
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      z-index: 1000;
    }

    .print-button:hover {
      background: #764ba2;
    }

    @media print {
      .print-button { display: none; }
    }
  </style>
</head>
<body>
  <button class="print-button" onclick="window.print()">🖨️ Imprimir / Salvar como PDF</button>

  <div class="page">
    <div class="header">
      <h1>🏥 EloSaúde</h1>
      <p>Análise de Exames Laboratoriais</p>
    </div>

    <div class="patient-section">
      <h3>Informações do Paciente</h3>
      <div class="patient-info">
        <p><strong>Paciente:</strong> ${patientName}</p>
        <p><strong>Data da Análise:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        <p><strong>Horário:</strong> ${new Date().toLocaleTimeString('pt-BR')}</p>
      </div>
    </div>

    <div class="analysis-section">
      <h3>Resultados dos Exames</h3>
      <div class="analysis-content">
${analysisText}
      </div>
    </div>

    <div class="footer">
      <p>Relatório gerado por EloSaúde - Análise de Exames Laboratoriais com IA</p>
      <p>Este documento é para fins informativos e deve ser analisado por um profissional de saúde qualificado.</p>
    </div>
  </div>
</body>
</html>`;
}

app.post('/api/analyze', async (req, res) => {
  try {
    const { pdfBase64, patientName } = req.body;

    if (!pdfBase64) {
      return res.status(400).json({ error: 'PDF não fornecido' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API Key não configurada' });
    }

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64,
              },
            },
            {
              type: 'text',
              text: 'Analise este PDF de exame laboratorial e retorne os valores encontrados em JSON.',
            },
          ],
        },
      ],
    });

    const responseText = message.content[0].text;
    const htmlReport = generateHTMLReport(patientName || 'Paciente', responseText);
    
    // Codificar o HTML em base64 para enviar como JSON
    const htmlBase64 = Buffer.from(htmlReport).toString('base64');
    
    res.json({
      success: true,
      html: htmlBase64,
      patientName: patientName || 'Paciente',
      analysisDate: new Date().toLocaleDateString('pt-BR')
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em porta ${PORT}`);
});
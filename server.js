import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import cors from 'cors';
import fs from 'fs';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
  const html = fs.readFileSync('./public/index.html', 'utf8');
  res.send(html);
});

function generateHTMLReport(patientName, exames) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resultado - ${patientName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; padding: 20px; color: #1a1a1a; }
    .page { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #1D9E75; }
    .header h1 { font-size: 28px; color: #1D9E75; margin-bottom: 4px; }
    .header p { color: #6b7280; font-size: 14px; }
    .patient-box { background: #f0fdf4; border-left: 4px solid #1D9E75; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
    .patient-box p { font-size: 14px; margin: 4px 0; }
    .patient-box strong { color: #0F6E56; }
    h2 { font-size: 16px; color: #1D9E75; margin: 24px 0 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 8px; }
    th { background: #1D9E75; color: white; padding: 10px 12px; text-align: left; }
    td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) { background: #f9fafb; }
    .status-normal { color: #166534; font-weight: 600; }
    .status-alto { color: #b91c1c; font-weight: 600; }
    .status-baixo { color: #92400e; font-weight: 600; }
    .summary { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin-top: 24px; font-size: 13px; line-height: 1.7; }
    .summary h3 { color: #1d4ed8; margin-bottom: 8px; }
    .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 16px; }
    .print-btn { position: fixed; top: 20px; right: 20px; padding: 10px 20px; background: #1D9E75; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; }
    @media print { .print-btn { display: none; } body { background: white; padding: 0; } .page { box-shadow: none; } }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
  <div class="page">
    <div class="header">
      <h1>EloSaúde</h1>
      <p>Análise de Exames Laboratoriais</p>
    </div>
    ${exames}
    <div class="footer">
      <p>Relatório gerado por EloSaúde · Análise com Inteligência Artificial</p>
      <p>Este documento é educativo e deve ser avaliado por um profissional de saúde.</p>
    </div>
  </div>
</body>
</html>`;
}

app.post('/api/analyze', async (req, res) => {
  try {
    const { pdfBase64, patientName } = req.body;

    if (!pdfBase64) return res.status(400).json({ error: 'PDF não fornecido' });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API Key não configurada' });

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
            },
            {
              type: 'text',
              text: `Você é um assistente de saúde da EloSaúde. Analise este exame laboratorial e gere um relatório em HTML formatado.

Retorne APENAS o conteúdo HTML interno (sem <!DOCTYPE>, <html>, <head> ou <body>) com:

1. Uma div com class "patient-box" contendo:
   - Nome do paciente
   - Data da coleta
   - Médico solicitante (se houver)
   - Laboratório (se houver)

2. Para cada grupo de exames (ex: Hemograma, Bioquímica, etc.), use:
   - <h2> com o nome do grupo
   - Uma <table> com colunas: Exame | Resultado | Referência | Status
   - Na coluna Status use: <span class="status-normal">✓ Normal</span> ou <span class="status-alto">↑ Elevado</span> ou <span class="status-baixo">↓ Baixo</span>

3. No final, uma div com class "summary" contendo:
   - <h3>📋 Resumo Clínico</h3>
   - Um parágrafo com observações importantes sobre os resultados, destacando valores alterados e o que pode significar clinicamente.

Paciente: ${patientName || 'Paciente'}
Use português brasileiro correto, sem caracteres corrompidos.`,
            },
          ],
        },
      ],
    });

    const htmlInner = message.content[0].text;
    const htmlReport = generateHTMLReport(patientName || 'Paciente', htmlInner);
    const htmlBase64 = Buffer.from(htmlReport, 'utf8').toString('base64');

    res.json({ success: true, html: htmlBase64 });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em porta ${PORT}`);
});
import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

const VALORES_IDEAIS = `
## TABELA DE VALORES IDEAIS ELOSÁUDE (use SEMPRE esta tabela, NUNCA os valores do laboratório)

### Avaliação Sanguínea
| Marcador | Mín Ideal | Máx Ideal |
|----------|-----------|-----------|
| Hemácias | 5.5 | 5.5 |
| Hemoglobina | 13.5 | 15.5 |
| Hematócrito | 39 | 46 |
| VCM | 88 | 92 |
| HCM | 28 | 32 |
| CHCM | 32 | 35 |
| RDW | 0 | 11 |
| Plaquetas | 180000 | 300000 |
| Leucócitos | 4000 | 6500 |
| Neutrófilos | 4000 | 6500 |
| Neutr. Bastonete | 0 | 0 |
| Linfócitos | 2500 | 2800 |
| Relação Neutrófilos/Linfócitos | 1 | 1.5 |
| Eosinófilos | 1 | 1 |
| Monócitos | 3 | 8 |
| Basófilos | 0 | 0.5 |

### Hematologia Específica
| Marcador | Mín Ideal | Máx Ideal |
|----------|-----------|-----------|
| Homocisteína | 5 | 9 |
| Ferro Sérico | 70 | 120 |
| Ferritina | 100 | 130 |
| Sat. Transferrina | 10 | 30 |
| Transferrina Livre | 212 | 360 |
| TFG | 90 | 90 |

### Perfil Lipídico
| Marcador | Mín Ideal | Máx Ideal |
|----------|-----------|-----------|
| Colesterol Total | 0 | 240 |
| LDL | 100 | 130 |
| HDL | 60 | 93 |
| VLDL | 5 | 20 |
| Triglicerides | 0 | 100 |

### Avaliação Hormonal
| Marcador | Mín Ideal | Máx Ideal |
|----------|-----------|-----------|
| TSH | 1 | 2.5 |
| T4 Livre | 0 | 1.4 |
| T3 Livre | 3 | 3.4 |
| ANTI-TPO | 0 | 34 |

### Avaliação Metabólica
| Marcador | Mín Ideal | Máx Ideal |
|----------|-----------|-----------|
| Glicose | 75 | 90 |
| Insulina | 0 | 6 |
| HOMA-IR | 0 | 1.3 |
| Hemoglobina Glicada | 0 | 5 |

### Avaliação Hepática
| Marcador | Mín Ideal | Máx Ideal |
|----------|-----------|-----------|
| TGO | 15 | 25 |
| TGP | 15 | 25 |
| Gama GT | 0 | 16 |
| PCR | 0 | 1 |
| PCR Ultrassensível | 0 | 0.5 |
| Bilirrubina Total | 0 | 1.2 |
| Fosfatase Alcalina | 0 | 80 |
| Albumina | 35 | 55 |

### Avaliação Nutricional
| Marcador | Mín Ideal | Máx Ideal |
|----------|-----------|-----------|
| B9 (Ácido Fólico) | 12 | 17 |
| Vitamina B12 | 500 | 1200 |
| Cálcio Sérico | 9.3 | 10.2 |
| Vitamina D (25OHd3) | 50 | 150 |
| PTH | 25 | 40 |
| Magnésio | 2 | 2.2 |
| Selênio | 120 | 180 |
| Potássio | 0 | 4 |
| Sódio | 0 | 140 |
| Zinco Sérico | 96 | 115 |

### Avaliação Renal
| Marcador | Mín Ideal | Máx Ideal |
|----------|-----------|-----------|
| Creatinina | 0.8 | 1.2 |
| Ureia | 35 | 45 |
| Ácido Úrico | 0 | 3.9 |

## REGRAS DE CRITICIDADE
- 🔴 CRÍTICO: valor <= 70% do Mín Ideal OU >= 130% do Máx Ideal
- 🟠 ATENÇÃO: valor entre 70-99% do Mín OU entre 101-129% do Máx
- 🟡 LIMÍTROFE: dentro do ideal mas nos 10% inferiores/superiores do intervalo
- 🟢 NORMAL: dentro do intervalo ideal
`;

const HTML_TEMPLATE = (patientName, conteudo) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório EloSaúde — ${patientName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --orange-50: #FFF4E6; --orange-100: #FFE0B2; --orange-500: #F57C00; --orange-600: #E65100; --orange-800: #BF360C;
      --teal-50: #E0F7F4; --teal-100: #B2EBF2; --teal-500: #00ACC1; --teal-600: #00838F; --teal-800: #006064;
      --neutral-50: #FAFAF9; --neutral-100: #F5F4F1; --neutral-200: #E8E7E3; --neutral-400: #9E9D97; --neutral-600: #5F5E5A; --neutral-800: #2C2C2A;
      --success-bg: #EAF6EF; --success-text: #1B6B3A;
      --warning-bg: #FFF8E1; --warning-text: #7A5C00;
      --danger-bg: #FEECEB; --danger-text: #8B2020;
      --limitrofe-bg: #FFFDE7; --limitrofe-text: #5D4037;
      --font-display: 'Playfair Display', Georgia, serif;
      --font-body: 'DM Sans', system-ui, sans-serif;
      --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-body); background: var(--neutral-50); color: var(--neutral-800); font-size: 14px; line-height: 1.6; padding: 24px; }
    
    .page { max-width: 860px; margin: 0 auto; background: white; border-radius: var(--radius-lg); box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; }
    
    /* HEADER */
    .header { background: linear-gradient(135deg, var(--teal-600) 0%, var(--teal-800) 100%); padding: 32px 40px; color: white; display: flex; justify-content: space-between; align-items: flex-start; }
    .logo-text { font-family: var(--font-display); font-size: 32px; font-weight: 700; margin-bottom: 4px; }
    .logo-text .elo { color: white; }
    .logo-text .saude { color: var(--orange-100); }
    .header-tagline { font-size: 13px; opacity: 0.8; }
    .header-right { text-align: right; font-size: 13px; opacity: 0.85; line-height: 1.8; }
    .header-right strong { display: block; font-size: 15px; opacity: 1; }
    
    /* PATIENT INFO */
    .patient-bar { background: var(--orange-50); border-bottom: 1px solid var(--orange-100); padding: 16px 40px; display: flex; gap: 32px; flex-wrap: wrap; }
    .patient-field { display: flex; flex-direction: column; gap: 2px; }
    .patient-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--orange-600); }
    .patient-value { font-size: 14px; font-weight: 500; color: var(--neutral-800); }
    
    /* STATS */
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border-bottom: 1px solid var(--neutral-200); }
    .stat-box { padding: 20px; text-align: center; border-right: 1px solid var(--neutral-200); }
    .stat-box:last-child { border-right: none; }
    .stat-num { font-size: 28px; font-weight: 700; font-family: var(--font-display); }
    .stat-label { font-size: 11px; color: var(--neutral-400); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.06em; }
    
    /* CONTENT */
    .content { padding: 32px 40px; }
    
    .section-title { font-family: var(--font-display); font-size: 17px; font-weight: 600; color: var(--teal-600); margin: 28px 0 12px; padding-bottom: 8px; border-bottom: 2px solid var(--teal-50); display: flex; align-items: center; gap: 8px; }
    .section-title:first-child { margin-top: 0; }
    
    /* TABLE */
    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 8px; }
    thead tr { background: var(--teal-600); }
    th { color: white; padding: 10px 12px; text-align: left; font-weight: 500; font-size: 12px; letter-spacing: 0.04em; }
    td { padding: 10px 12px; border-bottom: 1px solid var(--neutral-200); }
    tr:hover td { background: var(--neutral-50); }
    
    /* STATUS BADGES */
    .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; white-space: nowrap; }
    .badge-critico { background: var(--danger-bg); color: var(--danger-text); }
    .badge-atencao { background: var(--warning-bg); color: var(--warning-text); }
    .badge-limitrofe { background: var(--limitrofe-bg); color: var(--limitrofe-text); }
    .badge-normal { background: var(--success-bg); color: var(--success-text); }
    
    /* ALERTS */
    .alert-box { border-radius: var(--radius-md); padding: 16px; margin-bottom: 12px; display: flex; gap: 12px; }
    .alert-danger { background: var(--danger-bg); border-left: 4px solid var(--danger-text); }
    .alert-warning { background: var(--warning-bg); border-left: 4px solid #F9A825; }
    .alert-icon { font-size: 18px; flex-shrink: 0; }
    .alert-title { font-weight: 600; font-size: 13px; margin-bottom: 2px; }
    .alert-body { font-size: 12px; line-height: 1.5; }
    
    /* SUMMARY */
    .summary-box { background: var(--teal-50); border-radius: var(--radius-md); padding: 20px; margin-top: 24px; }
    .summary-title { font-family: var(--font-display); font-size: 15px; font-weight: 600; color: var(--teal-600); margin-bottom: 10px; }
    .summary-text { font-size: 13px; line-height: 1.75; color: var(--neutral-600); }
    
    /* FOOTER */
    .footer { background: var(--neutral-100); padding: 20px 40px; border-top: 1px solid var(--neutral-200); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
    .footer-left { font-size: 12px; color: var(--neutral-600); line-height: 1.6; }
    .footer-right { font-size: 11px; color: var(--neutral-400); text-align: right; }
    
    /* PRINT */
    .print-btn { position: fixed; bottom: 24px; right: 24px; padding: 12px 24px; background: var(--orange-500); color: white; border: none; border-radius: 999px; cursor: pointer; font-family: var(--font-body); font-size: 14px; font-weight: 500; box-shadow: 0 4px 14px rgba(245,124,0,0.35); }
    .print-btn:hover { background: var(--orange-600); }
    @media print {
      body { background: white; padding: 0; }
      .page { box-shadow: none; border-radius: 0; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
  <div class="page">
    ${conteudo}
  </div>
</body>
</html>`;

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
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
          },
          {
            type: 'text',
            text: `Você é o assistente especializado da EloSaúde, consultório de Medicina Funcional de Eloise Mari Mendes (COREN/PR 740225).

${VALORES_IDEAIS}

INSTRUÇÕES:
1. Extraia TODOS os valores numéricos do PDF de exame
2. Compare CADA valor com a tabela EloSaúde acima (NUNCA use referências do laboratório)
3. Classifique conforme as regras de criticidade
4. Gere HTML com o design EloSaúde

Paciente: ${patientName || 'Paciente'}

Retorne APENAS o HTML interno da página (sem <!DOCTYPE>, <html>, <head>, <body>), seguindo EXATAMENTE esta estrutura:

<div class="header">
  <div>
    <div class="logo-text"><span class="elo">Elo</span><span class="saude">Saúde</span></div>
    <div class="header-tagline">Cuidado e Conhecimento</div>
  </div>
  <div class="header-right">
    <strong>Eloise Mari Mendes</strong>
    COREN/PR 740225<br>
    Medicina Funcional e Integrativa
  </div>
</div>

<div class="patient-bar">
  <div class="patient-field"><span class="patient-label">Paciente</span><span class="patient-value">[NOME DO PACIENTE DO PDF]</span></div>
  <div class="patient-field"><span class="patient-label">Data da Coleta</span><span class="patient-value">[DATA]</span></div>
  <div class="patient-field"><span class="patient-label">Médico Solicitante</span><span class="patient-value">[MÉDICO SE HOUVER]</span></div>
  <div class="patient-field"><span class="patient-label">Data da Análise</span><span class="patient-value">[DATA DE HOJE]</span></div>
</div>

<div class="stats-row">
  <div class="stat-box"><div class="stat-num" style="color:#8B2020">[N]</div><div class="stat-label">🔴 Críticos</div></div>
  <div class="stat-box"><div class="stat-num" style="color:#7A5C00">[N]</div><div class="stat-label">🟠 Atenção</div></div>
  <div class="stat-box"><div class="stat-num" style="color:#5D4037">[N]</div><div class="stat-label">🟡 Limítrofes</div></div>
  <div class="stat-box"><div class="stat-num" style="color:#1B6B3A">[N]</div><div class="stat-label">🟢 Normais</div></div>
</div>

<div class="content">
  [Para cada grupo de exames encontrado no PDF, crie uma seção:]

  <h2 class="section-title">📊 [Nome do Grupo]</h2>
  <table>
    <thead><tr><th>Marcador</th><th>Resultado</th><th>Ref. EloSaúde</th><th>Status</th></tr></thead>
    <tbody>
      [Para cada exame:]
      <tr>
        <td>[Nome do marcador]</td>
        <td><strong>[valor] [unidade]</strong></td>
        <td>[mín] – [máx] [unidade]</td>
        <td><span class="badge badge-[critico|atencao|limitrofe|normal]">[🔴 CRÍTICO | 🟠 ATENÇÃO | 🟡 LIMÍTROFE | 🟢 NORMAL]</span></td>
      </tr>
    </tbody>
  </table>

  [Se houver alertas críticos ou de atenção, adicione:]
  <h2 class="section-title">⚠️ Alertas Clínicos</h2>
  [Para cada alerta:]
  <div class="alert-box alert-[danger|warning]">
    <div class="alert-icon">[🔴|🟠]</div>
    <div>
      <div class="alert-title">[Nome do marcador] — [status]</div>
      <div class="alert-body">[Interpretação clínica baseada na tabela de interpretações EloSaúde]</div>
    </div>
  </div>

  <div class="summary-box">
    <div class="summary-title">📋 Resumo Clínico para Eve</div>
    <div class="summary-text">[Resumo completo com principais achados, padrões identificados e pontos de atenção clínica. Escreva em português brasileiro correto, de forma técnica mas clara.]</div>
  </div>
</div>

<div class="footer">
  <div class="footer-left">
    <strong>Eloise Mari Mendes</strong> · COREN/PR 740225<br>
    EloSaúde — Medicina Funcional e Integrativa
  </div>
  <div class="footer-right">
    Este relatório é para uso clínico interno.<br>
    Gerado em ${new Date().toLocaleDateString('pt-BR')}
  </div>
</div>

IMPORTANTE:
- Use português brasileiro correto, SEM caracteres corrompidos
- Compare SEMPRE com a tabela EloSaúde, nunca com referências do laboratório
- Inclua interpretações clínicas relevantes nos alertas
- Se um exame não estiver na tabela EloSaúde, coloque status 🟢 NORMAL e ref. "—"
- Números com vírgula decimal são brasileiros (ex: 3,90 = 3.90)`
          }
        ]
      }]
    });

    const htmlInner = message.content[0].text
      .replace(/^```html\n?/, '').replace(/\n?```$/, '').trim();

    const htmlReport = HTML_TEMPLATE(patientName || 'Paciente', htmlInner);
    const htmlBase64 = Buffer.from(htmlReport, 'utf8').toString('base64');

    res.json({ success: true, html: htmlBase64 });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor EloSaúde rodando na porta ${PORT}`));
import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

const VALORES_IDEAIS = `
TABELA DE VALORES IDEAIS ELOSÁUDE — use SEMPRE esta tabela, NUNCA os valores do laboratório

=== AVALIAÇÃO SANGUÍNEA ===
Hemácias: 5.5 a 5.5 milhões/mm³
Hemoglobina: 13.5 a 15.5 g/dL
Hematócrito: 39 a 46 %
VCM: 88 a 92 fL
HCM: 28 a 32 pg
CHCM: 32 a 35 %
RDW: 0 a 11 %
Plaquetas: 180000 a 300000 /mm³
Leucócitos: 4000 a 6500 /mm³
Neutrófilos: 4000 a 6500 /mm³
Neutr. Bastonete: 0 a 0 /mm³
Linfócitos: 2500 a 2800 /mm³
Relação Neutrófilos/Linfócitos: 1 a 1.5
Eosinófilos: 1 a 1 %
Monócitos: 3 a 8 %
Basófilos: 0 a 0.5 %

=== HEMATOLOGIA ESPECÍFICA ===
Homocisteína: 5 a 9 µmol/L
Ferro Sérico: 70 a 120 µg/dL
Ferritina: 100 a 130 ng/mL
Sat. Transferrina: 10 a 30 %
Transferrina Livre: 212 a 360 mg/dL
TTPA: 30 a 30 seg
Fibrinogênio: 150 a 250 mg/dL
TFG: 90 a 90 mL/min
Cistatina C: 0.5 a 1 mg/L

=== PERFIL LIPÍDICO ===
Colesterol Total: 0 a 240 mg/dL
LDL: 100 a 130 mg/dL
LDL Oxidado: 0 a 45 U/L
HDL: 60 a 93 mg/dL
VLDL: 5 a 20 mg/dL
Triglicerides: 0 a 100 mg/dL
Relação TG/HDL: 0 a 1.8
Relação LDL/HDL: 0 a 2.3
Relação CT/HDL: 0 a 3.3
Apo A1: 0 a 145 mg/dL
Apo B: 0 a 100 mg/dL
Relação ApoB/ApoA1: 0 a 0.6
Lp(a): 15 a 17 mg/dL
Adiponectina: 10 a 15 µg/mL

=== AVALIAÇÃO HORMONAL ===
TSH: 1 a 2.5 mUI/L
T4 Livre: 0 a 1.4 ng/dL
T3 Livre: 3 a 3.4 pg/mL
T3 Reverso: 0.1 a 0.2 ng/mL
ANTI-TPO: 0 a 34 UI/mL
Calcitonina: 0 a 5 pg/mL
Leptina: 4 a 6 ng/mL
Testosterona Total: 50 a 70 ng/dL
Testosterona Livre: 5 a 7 pg/mL
Estradiol: 150 a 350 pg/mL
Estradiol Livre: 3 a 4 pg/mL
SHBG: 40 a 60 nmol/L
LH Fase Folicular: 5 a 15 mUI/mL
LH Pico Ovulatório: 50 a 100 mUI/mL
LH Fase Lútea: 3 a 10 mUI/mL
FSH Fase Folicular: 3 a 8 mUI/mL
FSH Pico Ovulatório: 15 a 90 mUI/mL
FSH Fase Lútea: 3 a 8 mUI/mL
Progesterona Fase Folicular: 0.5 a 1 ng/mL
Progesterona Pico Ovulatório: 10 a 15 ng/mL
Progesterona Fase Lútea: 10 a 20 ng/mL
Estriol: 1 a 3 ng/mL
Pregnenolona: 60 a 150 ng/dL
Androstenediona: 1 a 2 ng/mL
Prolactina: 0 a 20 ng/mL
DHEA: 200 a 300 µg/dL
Cortisol sérico acordar: 10 a 20 µg/dL
Cortisol salivar total: 17.7 a 25.7 nmol/L
Cortisol salivar despertar: 13.1 a 18.3 nmol/L
Cortisol salivar tarde: 3 a 5.5 nmol/L
Cortisol salivar noite: 1 a 1.9 nmol/L
Somatomedina C (IGF-1): 200 a 300 ng/mL

=== AVALIAÇÃO METABÓLICA ===
Glicose: 75 a 90 mg/dL
Insulina: 0 a 6 µUI/mL
HOMA-IR: 0 a 1.3
Hemoglobina Glicada (HbA1c): 0 a 5 %
Amilase: 25 a 60 U/L
Lipase: 0 a 30 U/L
Aldolase: 0 a 5 U/L
Peptídeo C: 1.5 a 2 ng/mL
ADH (Vasopressina): 1 a 3 pg/mL

=== AVALIAÇÃO HEPÁTICA ===
TGO (AST): 15 a 25 U/L
TGP (ALT): 15 a 25 U/L
Relação TGO/TGP: 1 a 1.3
Gama GT (GGT): 0 a 16 U/L
PCR: 0 a 1 mg/L
PCR Ultrassensível: 0 a 0.5 mg/L
Procalcitonina: 0 a 0.1 ng/mL
Bilirrubina Direta: 0 a 0.4 mg/dL
Bilirrubina Indireta: 0 a 0.8 mg/dL
Bilirrubina Total: 0 a 1.2 mg/dL
Fosfatase Alcalina: 0 a 80 U/L
LDH: 60 a 160 U/L
Albumina: 35 a 55 g/L
Pré-albumina: 20 a 40 mg/dL

=== AVALIAÇÃO NUTRICIONAL ===
Vitamina A (Retinol Sérico): 0 a 0.5 mg/L
Vitamina B1 (Tiamina): 120 a 150 nmol/L
Vitamina B2 (Riboflavina): 8 a 12 µg/dL
Vitamina B3 (Niacina): 4 a 6 µg/mL
Vitamina B5 (Ácido Pantotênico): 5 a 15 µg/dL
Vitamina B6: 0 a 20 µg/L
Vitamina B7 (Biotina): 300 a 500 pg/mL
B9 (Ácido Fólico): 12 a 17 ng/mL
Vitamina B12: 500 a 1200 pg/mL
Ácido Metilmalônico: 0 a 220 nmol/L
Vitamina C: 1.4 a 1.9 mg/dL
Cálcio Iônico: 4.6 a 5.1 mg/dL
Cálcio Sérico: 9.3 a 10.2 mg/dL
Vitamina D (25OHd3): 50 a 150 ng/mL
1,25OHd3: 50 a 225 pg/mL
PTH: 25 a 40 pg/mL
Cobre (hemácia): 60 a 70 µg/dL
Cobre (sérico/plasma): 90 a 125 µg/dL
Magnésio: 2 a 2.2 mg/dL
Selênio: 120 a 180 µg/L
Manganês (sangue total): 20 a 25 µg/L
Cromo (sangue): 2.5 a 3.5 µg/L
Cromo (urina): 0 a 5 µg/L
Potássio: 0 a 4 mEq/L
Sódio: 0 a 140 mEq/L
Zinco Sangue: 6.5 a 8 µmol/L
Zinco Hemácia: 10 a 11 µmol/L
Zinco Sérico: 96 a 115 µg/dL
Ceruplasmina: 30 a 35 mg/dL

=== AVALIAÇÃO DE METAIS PESADOS ===
Chumbo Urina: 0 a 7.5 µg/L
Chumbo Sangue: 0 a 3 µg/dL
Mercúrio Urina: 0 a 1 µg/L
Mercúrio Sangue: 0 a 2.9 µg/L
Cádmio Urina: 0 a 0.1 µg/L
Cádmio Sangue: 0 a 0.1 µg/L
Alumínio Urina: 0 a 10 µg/L
Alumínio Soro: 0 a 2 µg/dL
Arsênico Urina: 0 a 5 µg/L
Flúor Urina: 0 a 0.5 mg/L
Níquel Urina: 0 a 0 µg/L
Níquel Sangue: 0 a 0 µg/L

=== AVALIAÇÃO RENAL ===
Creatinina: 0.8 a 1.2 mg/dL
Ureia: 35 a 45 mg/dL
Ácido Úrico: 0 a 3.9 mg/dL
Densidade Urinária: 1005 a 1010
pH Urinário: 6.6 a 7.5

=== AVALIAÇÃO INTESTINAL / MICROBIOTA ===
Calprotectina: 0 a 10 µg/g
Lactoferrina: 0 a 5 µg/mL
Gastrina: 0 a 100 pg/mL
Razão Firmicutes/Bacteroidetes: 0.7 a 1
Índice Firmicutes+Bacteroidetes: 85 a 95 %

=== AVALIAÇÃO CARDÍACA ===
D-Dímero: 0 a 200 ng/mL
Troponina I: 0 a 0 ng/mL
Troponina T: 0 a 0 ng/mL
CK-MB: 0 a 10 U/L
Mioglobina: 0 a 30 ng/mL
Aldosterona: 6 a 15 ng/dL
Renina: 1.5 a 2 ng/mL/h
Angiotensina II: 20 a 40 pg/mL

=== AVALIAÇÃO CEREBRAL E MARCADORES TUMORAIS ===
Proteína S100B: 0 a 0.1 µg/L
Neurofilamento leve (Nf-L): 0 a 10 pg/mL
Calcitonina: 0 a 5 pg/mL

=== INTERPRETAÇÕES CLÍNICAS ===
Ácido Metilmalônico acima: Pode indicar deficiência funcional de B12 mesmo com sérico normal
Ácido Úrico acima: Risco de gota ou alteração renal
Adiponectina abaixo: Possível resistência à insulina e inflamação metabólica
Albumina abaixo: Possível desnutrição ou comprometimento hepático
Apo B acima: Maior número de partículas aterogênicas — risco aumentado de aterosclerose
Cálcio abaixo: Risco de fraqueza muscular e óssea
Cálcio acima: Possível distúrbio hormonal ou doença óssea
Cistatina C acima: Possível redução de TFG — avaliar doença renal inicial
Colesterol Total acima: Risco cardiovascular aumentado
Creatinina acima: Possível alteração renal
Ferritina abaixo: Possível deficiência de ferro — reservas depletadas
Ferritina acima: Possível inflamação ou sobrecarga de ferro
Ferro Sérico abaixo: Transporte de oxigênio comprometido — correlacionar com ferritina
Ferro Sérico acima: Possível sobrecarga de ferro — correlacionar com ferritina e saturação
Gama GT acima: Possível alteração hepática ou uso excessivo de álcool
Glicose abaixo: Possível hipoglicemia
Glicose acima: Possível alteração do metabolismo da glicose
HDL abaixo: Redução da proteção cardiovascular
Hematócrito abaixo: Possível anemia ou deficiência nutricional
Hemoglobina abaixo: Investigar possível anemia — avaliar reposição de ferro
Hemoglobina Glicada acima: Controle glicêmico inadequado
HOMA-IR acima: Resistência à insulina e hiperinsulinemia — risco cardiometabólico
Homocisteína acima: Metilação ineficiente — possível deficiência de B12/Folato/B6
Somatomedina C abaixo: Baixa sinalização anabólica — avaliar desnutrição ou deficiência hormonal
Insulina acima: Possível hiperinsulinemia por resistência à insulina
LDL acima: Risco aumentado de doenças cardíacas
Leptina acima: Possível resistência à leptina — associada à obesidade e inflamação
Leucócitos abaixo: Investigar imunossupressão
Leucócitos acima: Possível infecção ou inflamação ativa
Lp(a) acima: Risco genético aumentado para doença cardiovascular e trombose
Magnésio abaixo: Cofator essencial — impacta ativação de Vitamina D e função neuromuscular
PCR acima: Processo inflamatório ativo — identificar foco
Peptídeo C abaixo: Possível baixa reserva de células beta — risco de hiperglicemia
Peptídeo C acima: Possível hiperinsulinemia por resistência à insulina
Plaquetas abaixo: Possível distúrbio de coagulação
Plaquetas acima: Possível reação inflamatória ou infecciosa
Potássio abaixo: Risco de sintomas musculares por hipocalemia
PTH acima: Hiperparatireoidismo — frequentemente secundário à deficiência de Vitamina D
Relação TG/HDL acima: Possível resistência à insulina e esteatose hepática
Sat. Transferrina abaixo: Deficiência no transporte de ferro disponível
Selênio abaixo: Redução da proteção antioxidante e da função tireoidiana
Sódio acima: Possível desidratação
T4 Livre abaixo: Possível hipotireoidismo — monitorar fadiga e sonolência
T4 Livre acima: Possível hipertireoidismo — monitorar palpitações e nervosismo
TGO/TGP acima: Possível lesão hepática
Triglicerides acima: Risco cardiovascular aumentado
TSH abaixo: Possível hipertireoidismo — monitorar ansiedade, perda de peso, insônia
TSH acima: Possível hipotireoidismo — monitorar cansaço, ganho de peso, pele seca
Ureia acima: Possível disfunção renal ou desidratação
Vitamina B12 abaixo: Risco de anemia megaloblástica e alterações neurológicas
Vitamina B9 abaixo: Risco de anemia megaloblástica e comprometimento de metilação
Vitamina C abaixo: Redução da imunidade e da síntese de colágeno
Vitamina B1 abaixo: Risco de comprometimento neurológico e energético
Vitamina B6 abaixo: Impacto em metilação, neurotransmissores e metabolismo de aminoácidos
Vitamina A abaixo: Comprometimento imune, visual e de integridade epitelial
Vitamina D abaixo: Risco de comprometimento ósseo e imunológico
Zinco abaixo: Impacto na imunidade, cicatrização e função metabólica
Cobre abaixo: Impacto em imunidade, formação de colágeno e metabolismo de ferro
Metais pesados acima: Exposição a metal tóxico — avaliar fonte e impacto sistêmico
`;

function buildHTML(patientName, conteudo) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatorio EloSaude - ${patientName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --orange-50:#FFF4E6;--orange-100:#FFE0B2;--orange-500:#F57C00;--orange-600:#E65100;
      --teal-50:#E0F7F4;--teal-500:#00ACC1;--teal-600:#00838F;--teal-800:#006064;
      --neutral-50:#FAFAF9;--neutral-100:#F5F4F1;--neutral-200:#E8E7E3;
      --neutral-400:#9E9D97;--neutral-600:#5F5E5A;--neutral-800:#2C2C2A;
      --success-bg:#EAF6EF;--success-text:#1B6B3A;
      --warning-bg:#FFF8E1;--warning-text:#7A5C00;
      --danger-bg:#FEECEB;--danger-text:#8B2020;
      --limitrofe-bg:#FFFDE7;--limitrofe-text:#5D4037;
      --font-display:'Playfair Display',Georgia,serif;
      --font-body:'DM Sans',system-ui,sans-serif;
    }
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:var(--font-body);background:var(--neutral-100);color:var(--neutral-800);font-size:14px;line-height:1.6;padding:24px;}
    .page{max-width:860px;margin:0 auto;background:white;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;}
    .header{background:linear-gradient(135deg,#00838F 0%,#006064 100%);padding:28px 40px;display:flex;justify-content:space-between;align-items:center;}
    .header-logo{display:flex;align-items:center;gap:12px;}
    .logo-text{font-family:var(--font-display);font-size:28px;font-weight:700;}
    .logo-text .elo{color:white;}
    .logo-text .saude{color:var(--orange-100);}
    .header-tagline{color:rgba(255,255,255,0.8);font-size:12px;margin-top:3px;}
    .header-right{text-align:right;color:rgba(255,255,255,0.85);font-size:13px;line-height:1.8;}
    .header-right strong{display:block;font-size:15px;color:white;}
    .patient-bar{background:var(--orange-50);border-bottom:1px solid var(--orange-100);padding:16px 40px;display:flex;gap:32px;flex-wrap:wrap;}
    .patient-field{display:flex;flex-direction:column;gap:2px;}
    .patient-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:var(--orange-600);}
    .patient-value{font-size:14px;font-weight:500;color:var(--neutral-800);}
    .stats-row{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid var(--neutral-200);}
    .stat-box{padding:20px;text-align:center;border-right:1px solid var(--neutral-200);}
    .stat-box:last-child{border-right:none;}
    .stat-num{font-size:28px;font-weight:700;font-family:var(--font-display);}
    .stat-label{font-size:11px;color:var(--neutral-400);margin-top:2px;text-transform:uppercase;letter-spacing:0.06em;}
    .content{padding:32px 40px;}
    .section-title{font-family:var(--font-display);font-size:16px;font-weight:600;color:var(--teal-600);margin:28px 0 12px;padding-bottom:8px;border-bottom:2px solid var(--teal-50);}
    .section-title:first-child{margin-top:0;}
    table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:8px;}
    thead tr{background:var(--teal-600);}
    th{color:white;padding:10px 12px;text-align:left;font-weight:500;font-size:12px;}
    td{padding:10px 12px;border-bottom:1px solid var(--neutral-200);}
    tr:hover td{background:var(--neutral-50);}
    .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600;}
    .badge-critico{background:var(--danger-bg);color:var(--danger-text);}
    .badge-atencao{background:var(--warning-bg);color:var(--warning-text);}
    .badge-limitrofe{background:var(--limitrofe-bg);color:var(--limitrofe-text);}
    .badge-normal{background:var(--success-bg);color:var(--success-text);}
    .alert-box{border-radius:10px;padding:16px;margin-bottom:12px;display:flex;gap:12px;align-items:flex-start;}
    .alert-danger{background:var(--danger-bg);border-left:4px solid var(--danger-text);}
    .alert-warning{background:var(--warning-bg);border-left:4px solid #F9A825;}
    .alert-title{font-weight:600;font-size:13px;margin-bottom:4px;}
    .alert-body{font-size:12px;line-height:1.6;}
    .summary-box{background:var(--teal-50);border-radius:10px;padding:20px;margin-top:24px;}
    .summary-title{font-family:var(--font-display);font-size:15px;font-weight:600;color:var(--teal-600);margin-bottom:10px;}
    .summary-text{font-size:13px;line-height:1.75;color:var(--neutral-600);}
    .footer{background:var(--neutral-100);padding:20px 40px;border-top:1px solid var(--neutral-200);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;}
    .footer-left{font-size:12px;color:var(--neutral-600);line-height:1.6;}
    .footer-right{font-size:11px;color:var(--neutral-400);text-align:right;}
    .print-btn{position:fixed;bottom:24px;right:24px;padding:12px 24px;background:var(--orange-500);color:white;border:none;border-radius:999px;cursor:pointer;font-family:var(--font-body);font-size:14px;font-weight:500;box-shadow:0 4px 14px rgba(245,124,0,0.35);}
    .print-btn:hover{background:var(--orange-600);}
    @media print{body{background:white;padding:0;}.page{box-shadow:none;border-radius:0;}.print-btn{display:none;}}
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">Imprimir / Salvar PDF</button>
  <div class="page">
    <div class="header">
      <div class="header-logo">
        <div>
          <div class="logo-text"><span class="elo">Elo</span><span class="saude">Saude</span></div>
          <div class="header-tagline">Cuidado e Conhecimento</div>
        </div>
      </div>
      <div class="header-right">
        <strong>Eloise Mari Mendes</strong>
        COREN/PR 740225<br>
        Medicina Funcional e Integrativa
      </div>
    </div>
    ${conteudo}
    <div class="footer">
      <div class="footer-left"><strong>Eloise Mari Mendes</strong> · COREN/PR 740225<br>EloSaude — Medicina Funcional e Integrativa</div>
      <div class="footer-right">Relatorio para uso clinico interno.<br>Gerado em ${new Date().toLocaleDateString('pt-BR')}</div>
    </div>
  </div>
</body>
</html>`;
}

app.post('/api/analyze', async (req, res) => {
  try {
    const { pdfBase64, patientName } = req.body;
    if (!pdfBase64) return res.status(400).json({ error: 'PDF nao fornecido' });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API Key nao configurada' });

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
            text: `Voce e o assistente especializado da EloSaude, consultorio de Medicina Funcional de Eloise Mari Mendes (COREN/PR 740225).

${VALORES_IDEAIS}

INSTRUCOES OBRIGATORIAS:
1. Extraia TODOS os valores numericos do PDF
2. Compare CADA valor com a tabela EloSaude acima — NUNCA use referencias do laboratorio
3. Classifique conforme:
   - CRITICO: valor <= 70% do Min OU >= 130% do Max
   - ATENCAO: valor entre 70-99% do Min OU 101-129% do Max  
   - LIMITROFE: dentro do ideal mas nos 10% extremos do intervalo
   - NORMAL: dentro do intervalo ideal
4. Retorne APENAS HTML puro — sem markdown, sem blocos de codigo, sem emojis
5. Use portugues brasileiro correto, sem caracteres corrompidos

Paciente: ${patientName || 'Paciente'}
Data de hoje: ${new Date().toLocaleDateString('pt-BR')}

Retorne EXATAMENTE este HTML (substituindo os campos em maiusculo):

<div class="patient-bar">
  <div class="patient-field"><span class="patient-label">Paciente</span><span class="patient-value">NOME DO PACIENTE</span></div>
  <div class="patient-field"><span class="patient-label">Data da Coleta</span><span class="patient-value">DATA DO PDF</span></div>
  <div class="patient-field"><span class="patient-label">Medico Solicitante</span><span class="patient-value">MEDICO SE HOUVER</span></div>
  <div class="patient-field"><span class="patient-label">Data da Analise</span><span class="patient-value">${new Date().toLocaleDateString('pt-BR')}</span></div>
</div>

<div class="stats-row">
  <div class="stat-box"><div class="stat-num" style="color:#8B2020">N</div><div class="stat-label">Criticos</div></div>
  <div class="stat-box"><div class="stat-num" style="color:#7A5C00">N</div><div class="stat-label">Atencao</div></div>
  <div class="stat-box"><div class="stat-num" style="color:#5D4037">N</div><div class="stat-label">Limitrofes</div></div>
  <div class="stat-box"><div class="stat-num" style="color:#1B6B3A">N</div><div class="stat-label">Normais</div></div>
</div>

<div class="content">

[Para cada grupo de exames, repita este bloco:]
<h2 class="section-title">NOME DO GRUPO</h2>
<table>
  <thead><tr><th>Marcador</th><th>Resultado</th><th>Ref. EloSaude</th><th>Status</th></tr></thead>
  <tbody>
    <tr>
      <td>NOME DO MARCADOR</td>
      <td><strong>VALOR UNIDADE</strong></td>
      <td>MIN a MAX UNIDADE</td>
      <td><span class="badge badge-[critico|atencao|limitrofe|normal]">STATUS</span></td>
    </tr>
  </tbody>
</table>

[Se houver alertas, adicione:]
<h2 class="section-title">Alertas Clinicos</h2>
<div class="alert-box alert-[danger|warning]">
  <div>
    <div class="alert-title">MARCADOR — STATUS</div>
    <div class="alert-body">INTERPRETACAO CLINICA DA TABELA ELOSÁUDE</div>
  </div>
</div>

<div class="summary-box">
  <div class="summary-title">Resumo Clinico para Eve</div>
  <div class="summary-text">RESUMO COMPLETO EM PORTUGUES CORRETO SEM EMOJIS</div>
</div>

</div>`
          }
        ]
      }]
    });

    let htmlInner = message.content[0].text
      .replace(/^```html\n?/, '')
      .replace(/\n?```$/, '')
      .trim();

    const htmlReport = buildHTML(patientName || 'Paciente', htmlInner);
    const htmlBase64 = Buffer.from(htmlReport, 'utf8').toString('base64');

    res.json({ success: true, html: htmlBase64 });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor EloSaude rodando na porta ' + PORT));

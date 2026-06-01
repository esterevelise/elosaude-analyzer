import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

const SINONIMOS = `
=== SINONIMOS E EQUIVALENCIAS (trate como o mesmo marcador) ===
Eritrócitos = Hemácias = Glóbulos Vermelhos: 5.5 a 5.5 milhões/mm³
AST = TGO = Aspartato Aminotransferase: 15 a 25 U/L
ALT = TGP = Alanina Aminotransferase: 15 a 25 U/L
GGT = Gama GT = Gama Glutamiltransferase: 0 a 16 U/L
HbA1c = Hemoglobina Glicada = Glicohemoglobina: 0 a 5 %
IGF-1 = Somatomedina C = Fator de Crescimento Insulínico: 200 a 300 ng/mL
Glicemia = Glicose = Glicemia de Jejum: 75 a 90 mg/dL
Ureia = BUN = Nitrogênio Ureico: 35 a 45 mg/dL
HDL = HDL-Colesterol = Colesterol HDL: 60 a 93 mg/dL
LDL = LDL-Colesterol = Colesterol LDL: 100 a 130 mg/dL
VLDL = VLDL-Colesterol = Colesterol VLDL: 5 a 20 mg/dL
CT = Colesterol Total = Colesterol: 0 a 240 mg/dL
TG = Triglicérides = Triglicerideos = Triglicerídeos: 0 a 100 mg/dL
PCR = Proteína C Reativa: 0 a 1 mg/L
PCR-us = PCR Ultrassensível: 0 a 0.5 mg/L
FA = Fosfatase Alcalina: 0 a 80 U/L
DHL = LDH = Desidrogenase Láctica: 60 a 160 U/L
TSH = Hormônio Tireoestimulante: 1 a 2.5 mUI/L
Anti-TPO = ATPO = Anticorpo Antitireoperoxidase: 0 a 34 UI/mL
Ác. Fólico = Folato = B9 = Vitamina B9: 12 a 17 ng/mL
Cobalamina = B12 = Vitamina B12: 500 a 1200 pg/mL
25-OH Vitamina D = 25OHD = Vitamina D = Calcidiol: 50 a 150 ng/mL
PTHi = PTH = Paratormônio: 25 a 40 pg/mL
Mg = Magnésio = Magnésio Sérico: 2 a 2.2 mg/dL
Ca = Cálcio = Cálcio Sérico: 9.3 a 10.2 mg/dL
Na = Sódio = Sódio Sérico: 0 a 140 mEq/L
K = Potássio = Potássio Sérico: 0 a 4 mEq/L
Zn = Zinco Sérico: 96 a 115 µg/dL
Se = Selênio: 120 a 180 µg/L
Fe = Ferro = Ferro Sérico: 70 a 120 µg/dL
DHEA-S = DHEAS = DHEA Sulfato = DHEA: 200 a 300 µg/dL
Cortisol Basal = Cortisol Sérico Acordar: 10 a 20 µg/dL
Segmentados = Neutrófilos Segmentados = Neutrófilos: 4000 a 6500 /mm³
`;

const VALORES_IDEAIS = `
=== TABELA DE VALORES IDEAIS ELOSÁUDE (NUNCA use referências do laboratório) ===

AVALIAÇÃO SANGUÍNEA:
Hemácias (Eritrócitos): 5.5 a 5.5 milhões/mm³
Hemoglobina: 13.5 a 15.5 g/dL
Hematócrito: 39 a 46 %
VCM: 88 a 92 fL
HCM: 28 a 32 pg
CHCM: 32 a 35 %
RDW: 0 a 11 %
Plaquetas: 180000 a 300000 /mm³
Leucócitos: 4000 a 6500 /mm³
Neutrófilos (Segmentados): 4000 a 6500 /mm³
Neutr. Bastonete: 0 a 0 /mm³
Linfócitos: 2500 a 2800 /mm³
Relação Neutrófilos/Linfócitos: 1 a 1.5
Eosinófilos: 1 a 1 %
Monócitos: 3 a 8 %
Basófilos: 0 a 0.5 %

HEMATOLOGIA ESPECÍFICA:
Homocisteína: 5 a 9 µmol/L
Ferro Sérico: 70 a 120 µg/dL
Ferritina: 100 a 130 ng/mL
Sat. Transferrina: 10 a 30 %
Transferrina Livre: 212 a 360 mg/dL
TTPA: 30 a 30 seg
Fibrinogênio: 150 a 250 mg/dL
TFG: 90 a 90 mL/min
Cistatina C: 0.5 a 1 mg/L

PERFIL LIPÍDICO:
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

AVALIAÇÃO HORMONAL:
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

AVALIAÇÃO METABÓLICA:
Glicose: 75 a 90 mg/dL
Insulina: 0 a 6 µUI/mL
HOMA-IR: 0 a 1.3
Hemoglobina Glicada (HbA1c): 0 a 5 %
Amilase: 25 a 60 U/L
Lipase: 0 a 30 U/L
Aldolase: 0 a 5 U/L
Peptídeo C: 1.5 a 2 ng/mL
ADH (Vasopressina): 1 a 3 pg/mL

AVALIAÇÃO HEPÁTICA:
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

AVALIAÇÃO NUTRICIONAL:
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
S�dio: 0 a 140 mEq/L
Zinco Sangue: 6.5 a 8 µmol/L
Zinco Hemácia: 10 a 11 µmol/L
Zinco Sérico: 96 a 115 µg/dL
Ceruplasmina: 30 a 35 mg/dL

AVALIAÇÃO DE METAIS PESADOS:
Chumbo Urina: 0 a 7.5 µg/L | Chumbo Sangue: 0 a 3 µg/dL
Mercúrio Urina: 0 a 1 µg/L | Mercúrio Sangue: 0 a 2.9 µg/L
Cádmio Urina: 0 a 0.1 µg/L | Cádmio Sangue: 0 a 0.1 µg/L
Alumínio Urina: 0 a 10 µg/L | Alumínio Soro: 0 a 2 µg/dL
Arsênico Urina: 0 a 5 µg/L | Flúor Urina: 0 a 0.5 mg/L
Níquel Urina: 0 a 0 µg/L | Níquel Sangue: 0 a 0 µg/L

AVALIAÇÃO RENAL:
Creatinina: 0.8 a 1.2 mg/dL
Ureia: 35 a 45 mg/dL
Ácido Úrico: 0 a 3.9 mg/dL
Densidade Urinária: 1005 a 1010
pH Urinário: 6.6 a 7.5

AVALIAÇÃO INTESTINAL:
Calprotectina: 0 a 10 µg/g | Lactoferrina: 0 a 5 µg/mL
Gastrina: 0 a 100 pg/mL
Razão Firmicutes/Bacteroidetes: 0.7 a 1
Índice Firmicutes+Bacteroidetes: 85 a 95 %

AVALIAÇÃO CARDÍACA:
D-Dímero: 0 a 200 ng/mL | Troponina I: 0 a 0 ng/mL | Troponina T: 0 a 0 ng/mL
CK-MB: 0 a 10 U/L | Mioglobina: 0 a 30 ng/mL
Aldosterona: 6 a 15 ng/dL | Renina: 1.5 a 2 ng/mL/h | Angiotensina II: 20 a 40 pg/mL

AVALIAÇÃO CEREBRAL:
Proteína S100B: 0 a 0.1 µg/L | Neurofilamento leve (Nf-L): 0 a 10 pg/mL

=== INTERPRETAÇÕES CLÍNICAS ===
Ácido Metilmalônico acima: Pode indicar deficiência funcional de B12 mesmo com sérico normal
Ácido Úrico acima: Risco de gota ou alteração renal
Adiponectina abaixo: Possível resistência à insulina e inflamação metabólica
Albumina abaixo: Possível desnutrição ou comprometimento hepático
Apo B acima: Maior número de partículas aterogênicas — risco aumentado de aterosclerose
Cálcio abaixo: Risco de fraqueza muscular e óssea — correlacionar com PTH e Vitamina D
Cálcio acima: Possível distúrbio hormonal ou doença óssea
Cistatina C acima: Possível redução de TFG — avaliar doença renal inicial
Colesterol Total acima: Risco cardiovascular aumentado
Creatinina acima: Possível alteração renal
Ferritina abaixo: Possível deficiência de ferro — reservas depletadas
Ferritina acima: Possível inflamação ou sobrecarga de ferro
Ferro Sérico abaixo: Transporte de oxigênio comprometido — correlacionar com ferritina
Ferro Sérico acima: Possível sobrecarga de ferro
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
S�dio acima: Possível desidratação
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
Basófilos acima: Basofilia — investigar processo inflamatório, alérgico ou disfunção medular
Neutrófilos abaixo: Neutropenia — avaliar resposta imune e risco infeccioso aumentado
Linfócitos abaixo: Reserva imune reduzida — investigar imunossupressão
`;

function buildHTML(patientName, conteudo) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatorio EloSaude - ${patientName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --teal: #00838F; --teal-dark: #006064; --teal-light: #E0F7F4; --teal-mid: #00ACC1;
      --orange: #F57C00; --orange-dark: #E65100; --orange-light: #FFF4E6; --orange-100: #FFE0B2;
      --neutral-50: #FAFAF9; --neutral-100: #F5F4F1; --neutral-200: #E8E7E3;
      --neutral-400: #9E9D97; --neutral-600: #5F5E5A; --neutral-800: #2C2C2A;
      --critico-bg: #FEECEB; --critico-text: #8B2020; --critico-dot: #C62828;
      --atencao-bg: #FFF8E1; --atencao-text: #7A5C00; --atencao-dot: #F9A825;
      --limitrofe-bg: #FFFDE7; --limitrofe-text: #5D4037; --limitrofe-dot: #FBC02D;
      --normal-bg: #EAF6EF; --normal-text: #1B6B3A; --normal-dot: #2E7D32;
      --font-display: 'Playfair Display', Georgia, serif;
      --font-body: 'DM Sans', system-ui, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-body); background: #f0f0f0; color: var(--neutral-800); font-size: 13px; line-height: 1.5; }

    /* PAGE */
    .page { width: 210mm; min-height: 297mm; margin: 20px auto; background: white; box-shadow: 0 2px 16px rgba(0,0,0,0.12); padding: 0; overflow: hidden; }

    /* HEADER */
    .report-header { padding: 24px 32px 20px; border-bottom: 2px solid var(--teal); display: flex; justify-content: space-between; align-items: flex-start; }
    .header-logo-area { display: flex; align-items: center; gap: 14px; }
    .logo-icon { width: 52px; height: 52px; background: linear-gradient(135deg, var(--teal), var(--teal-dark)); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .logo-icon svg { width: 30px; height: 30px; fill: white; }
    .logo-name { font-family: var(--font-display); font-size: 22px; font-weight: 700; line-height: 1.1; }
    .logo-name .elo { color: var(--teal); }
    .logo-name .saude { color: var(--orange); }
    .logo-tagline { font-size: 10px; color: var(--neutral-400); letter-spacing: 0.12em; text-transform: uppercase; margin-top: 3px; }
    .header-report-info { text-align: right; }
    .header-report-title { font-family: var(--font-display); font-size: 16px; font-weight: 600; color: var(--teal); margin-bottom: 6px; }
    .header-report-meta { font-size: 11px; color: var(--neutral-600); line-height: 1.8; }

    /* PATIENT BAR */
    .patient-section { background: var(--neutral-50); border-bottom: 1px solid var(--neutral-200); padding: 16px 32px; }
    .patient-name { font-family: var(--font-display); font-size: 18px; font-weight: 600; color: var(--neutral-800); margin-bottom: 4px; border-left: 4px solid var(--orange); padding-left: 12px; }
    .patient-sub { font-size: 11px; color: var(--neutral-400); margin-bottom: 12px; padding-left: 16px; }
    .patient-fields { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .patient-field { }
    .patient-label { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--neutral-400); margin-bottom: 2px; }
    .patient-value { font-size: 12px; font-weight: 500; color: var(--neutral-800); }

    /* STATS */
    .stats-section { display: grid; grid-template-columns: repeat(4, 1fr); border-bottom: 1px solid var(--neutral-200); }
    .stat-box { padding: 16px; text-align: center; border-right: 1px solid var(--neutral-200); }
    .stat-box:last-child { border-right: none; }
    .stat-num { font-family: var(--font-display); font-size: 36px; font-weight: 700; line-height: 1; }
    .stat-label { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 4px; display: flex; align-items: center; justify-content: center; gap: 5px; }
    .stat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

    /* TABLE SECTION */
    .table-section { padding: 20px 32px; }
    .section-heading { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--teal); margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid var(--teal-light); }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    thead tr { background: var(--neutral-50); }
    th { padding: 8px 10px; text-align: left; font-size: 10px; font-weight: 600; color: var(--neutral-400); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid var(--neutral-200); white-space: nowrap; }
    td { padding: 9px 10px; border-bottom: 1px solid var(--neutral-200); vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    .td-marcador { font-weight: 500; color: var(--neutral-800); }
    .td-resultado { font-weight: 600; color: var(--neutral-800); white-space: nowrap; }
    .td-ref { color: var(--neutral-400); white-space: nowrap; }
    .td-obs { font-size: 11px; color: var(--neutral-600); line-height: 1.4; }
    .badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; white-space: nowrap; }
    .badge-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .badge-critico { background: var(--critico-bg); color: var(--critico-text); }
    .badge-critico .badge-dot { background: var(--critico-dot); }
    .badge-atencao { background: var(--atencao-bg); color: var(--atencao-text); }
    .badge-atencao .badge-dot { background: var(--atencao-dot); }
    .badge-limitrofe { background: var(--limitrofe-bg); color: var(--limitrofe-text); }
    .badge-limitrofe .badge-dot { background: var(--limitrofe-dot); }
    .badge-normal { background: var(--normal-bg); color: var(--normal-text); }
    .badge-normal .badge-dot { background: var(--normal-dot); }

    /* ALERTS */
    .alerts-section { padding: 0 32px 20px; }
    .alerts-heading { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--orange); margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid var(--orange-100); display: flex; align-items: center; gap: 6px; }
    .alert-item { border-radius: 8px; padding: 12px 14px; margin-bottom: 8px; border-left: 3px solid; }
    .alert-critico { background: var(--critico-bg); border-color: var(--critico-dot); }
    .alert-atencao { background: var(--atencao-bg); border-color: var(--atencao-dot); }
    .alert-title { font-weight: 600; font-size: 12px; color: var(--neutral-800); margin-bottom: 4px; }
    .alert-body { font-size: 11px; color: var(--neutral-600); line-height: 1.6; }

    /* FOOTER */
    .report-footer { border-top: 1px solid var(--neutral-200); padding: 14px 32px; display: flex; justify-content: space-between; align-items: center; background: var(--neutral-50); }
    .footer-left { font-size: 11px; color: var(--teal); font-weight: 500; line-height: 1.6; }
    .footer-right { font-size: 10px; color: var(--neutral-400); text-align: right; line-height: 1.6; }

    /* PRINT */
    .print-btn { position: fixed; bottom: 24px; right: 24px; padding: 12px 24px; background: var(--orange); color: white; border: none; border-radius: 999px; cursor: pointer; font-family: var(--font-body); font-size: 13px; font-weight: 600; box-shadow: 0 4px 14px rgba(245,124,0,0.4); z-index: 100; }
    .print-btn:hover { background: var(--orange-dark); }
    @media print {
      body { background: white; }
      .page { margin: 0; box-shadow: none; width: 100%; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">Imprimir / Salvar PDF</button>
  <div class="page">
    ${conteudo}
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
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
          {
            type: 'text',
            text: `Voce e o assistente especializado da EloSaude de Eloise Mari Mendes (COREN/PR 740225).

${SINONIMOS}

${VALORES_IDEAIS}

INSTRUCOES:
1. Extraia TODOS os valores do PDF
2. Use a tabela de SINONIMOS para identificar nomes alternativos do mesmo exame
3. Compare com a tabela EloSaude — NUNCA use referencias do laboratorio
4. Classifique: CRITICO (<=70% min ou >=130% max), ATENCAO (70-99% min ou 101-129% max), LIMITROFE (10% extremos do intervalo ideal), NORMAL
5. Retorne APENAS HTML puro, sem markdown, sem emojis, sem caracteres corrompidos
6. Ordene os resultados por criticidade: criticos primeiro, depois atencao, limitrofe, normal

Paciente: ${patientName || 'Paciente'}
Data hoje: ${new Date().toLocaleDateString('pt-BR')}

Retorne EXATAMENTE este HTML preenchido (sem nada fora dele):

<div class="report-header">
  <div class="header-logo-area">
    <div class="logo-icon">
      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" opacity="0"/><path d="M9 11h2v2H9zm4 0h2v2h-2zM12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>
    </div>
    <div>
      <div class="logo-name"><span class="elo">Elo</span><span class="saude">Saude</span></div>
      <div class="logo-tagline">Cuidado e Conhecimento</div>
    </div>
  </div>
  <div class="header-report-info">
    <div class="header-report-title">Relatorio de Analise Laboratorial</div>
    <div class="header-report-meta">
      Profissional: Eloise Mari Mendes · COREN/PR 740225<br>
      Especialidade: Medicina Funcional e Integrativa<br>
      Emitido em: ${new Date().toLocaleDateString('pt-BR')}
    </div>
  </div>
</div>

<div class="patient-section">
  <div class="patient-name">NOME COMPLETO DO PACIENTE DO PDF</div>
  <div class="patient-sub">SEXO · IDADE anos · Coleta: DATA_COLETA</div>
  <div class="patient-fields">
    <div class="patient-field"><div class="patient-label">Data do Exame</div><div class="patient-value">DATA_COLETA</div></div>
    <div class="patient-field"><div class="patient-label">Medico Solicitante</div><div class="patient-value">MEDICO OU —</div></div>
    <div class="patient-field"><div class="patient-label">Laboratorio</div><div class="patient-value">LABORATORIO OU —</div></div>
    <div class="patient-field"><div class="patient-label">N° Atendimento</div><div class="patient-value">NUMERO OU —</div></div>
  </div>
</div>

<div class="stats-section">
  <div class="stat-box"><div class="stat-num" style="color:var(--critico-dot)">N_CRITICOS</div><div class="stat-label"><span class="stat-dot" style="background:var(--critico-dot)"></span>CRITICO</div></div>
  <div class="stat-box"><div class="stat-num" style="color:var(--atencao-dot)">N_ATENCAO</div><div class="stat-label"><span class="stat-dot" style="background:var(--atencao-dot)"></span>ATENCAO</div></div>
  <div class="stat-box"><div class="stat-num" style="color:var(--limitrofe-dot)">N_LIMITROFE</div><div class="stat-label"><span class="stat-dot" style="background:var(--limitrofe-dot)"></span>LIMITROFE</div></div>
  <div class="stat-box"><div class="stat-num" style="color:var(--normal-dot)">N_NORMAIS</div><div class="stat-label"><span class="stat-dot" style="background:var(--normal-dot)"></span>NORMAL</div></div>
</div>

<div class="table-section">
  <div class="section-heading">Resultados — Classificacao por Criticidade</div>
  <table>
    <thead>
      <tr>
        <th style="width:22%">Marcador</th>
        <th style="width:12%">Resultado</th>
        <th style="width:8%">Min Ideal</th>
        <th style="width:8%">Max Ideal</th>
        <th style="width:12%">Criticidade</th>
        <th style="width:38%">Observacao Clinica</th>
      </tr>
    </thead>
    <tbody>
      [Para cada exame, ordenado por criticidade — criticos primeiro:]
      <tr>
        <td class="td-marcador">NOME DO MARCADOR</td>
        <td class="td-resultado">VALOR UNIDADE</td>
        <td class="td-ref">MIN</td>
        <td class="td-ref">MAX</td>
        <td><span class="badge badge-[critico|atencao|limitrofe|normal]"><span class="badge-dot"></span>[Critico|Atencao|Limitrofe|Normal]</span></td>
        <td class="td-obs">OBSERVACAO CLINICA DA TABELA ELOSÁUDE</td>
      </tr>
    </tbody>
  </table>
</div>

[Se houver alertas criticos ou de atencao:]
<div class="alerts-section">
  <div class="alerts-heading">Alertas Clinicos Automaticos</div>
  <div class="alert-item alert-[critico|atencao]">
    <div class="alert-title">Alerta N — TITULO DO ALERTA</div>
    <div class="alert-body">DESCRICAO DETALHADA DO ALERTA COM VALORES E CORRELACOES CLINICAS</div>
  </div>
</div>

<div class="report-footer">
  <div class="footer-left">
    Eloise Mari Mendes<br>
    COREN/PR 740225 · Medicina Funcional e Integrativa<br>
    EloSaude — Cuidado e Conhecimento
  </div>
  <div class="footer-right">
    Relatorio baseado em valores ideais funcionais proprietarios da EloSaude.<br>
    Nao substitui avaliacao clinica presencial.
  </div>
</div>

REGRAS ABSOLUTAS:
- Retorne APENAS o HTML acima preenchido, sem nada antes ou depois
- Sem markdown, sem blocos de codigo, sem emojis
- Portugues brasileiro correto, sem caracteres corrompidos
- Ordene sempre: criticos, atencao, limitrofe, normal
- Nas observacoes clinicas use as interpretacoes da tabela EloSaude`
          }
        ]
      }]
    });

    let htmlInner = message.content[0].text
      .replace(/^```html\n?/, '').replace(/\n?```$/, '').trim();

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
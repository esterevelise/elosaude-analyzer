import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";

const EloSaudeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const COLORS = {
    orange50: "#FFF4E6",
    orange500: "#F57C00",
    teal50: "#E0F7F4",
    teal500: "#00ACC1",
    neutral50: "#FAFAF9",
    neutral100: "#F5F4F1",
    neutral800: "#2C2C2A",
    success: "#EAF6EF",
    warning: "#FFF8E1",
    danger: "#FEECEB",
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Por favor, selecione um arquivo PDF válido");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Selecione um PDF para analisar");
      return;
    }

    if (!patientName.trim()) {
      setError("Digite o nome do paciente");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result?.split(",")[1];

        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pdfBase64: base64,
            patientName: patientName.trim(),
          }),
        });

        if (!response.ok) throw new Error("Erro na análise");

        const data = await response.json();
        setAnalysis(data);
        setFile(null);
        setPatientName("");
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!analysis) return;

    const htmlContent = generatePDFHTML(analysis);
    const printWindow = window.open("", "", "height=1200,width=900");
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const generatePDFHTML = (data) => {
    const criticalCount = data.results.filter((r) =>
      r.criticidade.includes("CRÍTICO")
    ).length;
    const warningCount = data.results.filter((r) =>
      r.criticidade.includes("ATENÇÃO")
    ).length;
    const normalCount = data.results.filter((r) =>
      r.criticidade.includes("NORMAL")
    ).length;

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Análise - ${data.patientName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'DM Sans', system-ui, sans-serif;
            color: #2C2C2A;
            background: white;
            padding: 40px;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #00ACC1;
            padding-bottom: 20px;
          }
          .logo-text {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
          }
          .logo-text span:first-child { color: #00ACC1; }
          .logo-text span:last-child { color: #F57C00; }
          .tagline { font-size: 14px; color: #9E9D97; }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 30px;
            background: #FAFAF9;
            padding: 20px;
            border-radius: 10px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
          }
          .info-label { font-weight: 600; color: #5F5E5A; }
          .info-value { color: #2C2C2A; }
          .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #F57C00;
            margin: 25px 0 15px 0;
            border-left: 4px solid #F57C00;
            padding-left: 12px;
          }
          .summary {
            background: #E0F7F4;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
            color: #00838F;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 13px;
          }
          th {
            background: #00ACC1;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #E8E7E3;
          }
          tr:nth-child(even) { background: #FAFAF9; }
          .critical { background: #FEECEB; }
          .warning { background: #FFF8E1; }
          .normal { background: #EAF6EF; }
          .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }
          .stat-box {
            padding: 15px;
            border-radius: 8px;
            text-align: center;
          }
          .stat-number {
            font-size: 24px;
            font-weight: 700;
          }
          .stat-label { font-size: 12px; color: #5F5E5A; margin-top: 5px; }
          .alerts {
            background: #FEECEB;
            border-left: 4px solid #8B2020;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .alert-item {
            margin-bottom: 10px;
            font-size: 13px;
          }
          .footer {
            border-top: 2px solid #E8E7E3;
            padding-top: 15px;
            margin-top: 30px;
            text-align: center;
            font-size: 11px;
            color: #9E9D97;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-text"><span>Elo</span><span>Saúde</span></div>
          <div class="tagline">Cuidado e Conhecimento</div>
        </div>

        <div class="info-grid">
          <div class="info-row">
            <span class="info-label">Paciente</span>
            <span class="info-value">${data.patientName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Data da Análise</span>
            <span class="info-value">${data.analysisDate}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Profissional</span>
            <span class="info-value">Eloise Mari Mendes (COREN/PR 740225)</span>
          </div>
        </div>

        ${data.summary ? `<div class="summary">${data.summary}</div>` : ""}

        <div class="stats">
          <div class="stat-box" style="background: #FEECEB;">
            <div class="stat-number" style="color: #8B2020;">🔴 ${criticalCount}</div>
            <div class="stat-label">Crítico</div>
          </div>
          <div class="stat-box" style="background: #FFF8E1;">
            <div class="stat-number" style="color: #7A5C00;">🟠 ${warningCount}</div>
            <div class="stat-label">Atenção</div>
          </div>
          <div class="stat-box" style="background: #EAF6EF;">
            <div class="stat-number" style="color: #1B6B3A;">🟢 ${normalCount}</div>
            <div class="stat-label">Normal</div>
          </div>
        </div>

        <h2 class="section-title">Seus Resultados</h2>
        <table>
          <thead>
            <tr>
              <th>Marcador</th>
              <th>Resultado</th>
              <th>Faixa Ideal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.results
              .sort((a, b) => {
                const order = {
                  "🔴 CRÍTICO": 0,
                  "🟠 ATENÇÃO MODERADA": 1,
                  "🟡 LIMÍTROFE": 2,
                  "🟢 NORMAL": 3,
                };
                return (order[a.criticidade] || 99) - (order[b.criticidade] || 99);
              })
              .map((result) => {
                let rowClass = "";
                if (result.criticidade.includes("CRÍTICO")) rowClass = "critical";
                else if (result.criticidade.includes("ATENÇÃO"))
                  rowClass = "warning";
                else if (result.criticidade.includes("NORMAL")) rowClass = "normal";

                return `
                  <tr class="${rowClass}">
                    <td><strong>${result.nome}</strong></td>
                    <td>${result.resultado} ${result.unidade}</td>
                    <td>${result.minIdeal} - ${result.maxIdeal}</td>
                    <td>${result.criticidade}</td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>

        ${
          data.alerts && data.alerts.length > 0
            ? `
          <div class="alerts">
            <h3 style="margin-bottom: 10px; color: #8B2020;">⚠️ Alertas Clínicos</h3>
            ${data.alerts.map((alert) => `<div class="alert-item">• ${alert}</div>`).join("")}
          </div>
        `
            : ""
        }

        <div class="footer">
          <strong>Eloise Mari Mendes</strong><br>
          COREN/PR 740225<br>
          EloSaúde — Consultório de Medicina Funcional<br><br>
          ⓘ Este relatório é um resumo educativo baseado nos seus resultados laboratoriais.
          Siga sempre as orientações do seu profissional de saúde.
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.neutral50,
        padding: "20px",
        fontFamily:
          "'DM Sans', 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "40px",
          paddingTop: "20px",
        }}
      >
        <div
          style={{
            fontSize: "36px",
            fontWeight: "700",
            marginBottom: "8px",
            letterSpacing: "-0.5px",
          }}
        >
          <span style={{ color: COLORS.teal500 }}>Elo</span>
          <span style={{ color: COLORS.orange500 }}>Saúde</span>
        </div>
        <div style={{ fontSize: "14px", color: "#9E9D97" }}>
          Análise Laboratorial Inteligente
        </div>
      </div>

      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          padding: "40px",
        }}
      >
        {!analysis ? (
          <form onSubmit={handleSubmit}>
            {/* Nome do Paciente */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: COLORS.neutral800,
                }}
              >
                Nome do Paciente
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Digite o nome completo"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  fontSize: "14px",
                  border: "1.5px solid #E8E7E3",
                  borderRadius: "10px",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = COLORS.teal500)}
                onBlur={(e) => (e.target.style.borderColor = "#E8E7E3")}
              />
            </div>

            {/* Upload PDF */}
            <div
              style={{
                marginBottom: "24px",
                padding: "32px",
                border: "2px dashed #E8E7E3",
                borderRadius: "12px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                background: file ? COLORS.teal50 : "transparent",
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.background = COLORS.orange50;
                e.currentTarget.style.borderColor = COLORS.orange500;
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.background = file ? COLORS.teal50 : "white";
                e.currentTarget.style.borderColor = "#E8E7E3";
              }}
              onDrop={(e) => {
                e.preventDefault();
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile?.type === "application/pdf") {
                  setFile(droppedFile);
                  setError(null);
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📄</div>
              <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px" }}>
                {file ? file.name : "Selecione o PDF do exame"}
              </div>
              <div style={{ fontSize: "12px", color: "#9E9D97" }}>
                {file
                  ? "✓ Arquivo selecionado"
                  : "Clique ou arraste o PDF aqui"}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: "#FEECEB",
                  color: "#8B2020",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  marginBottom: "20px",
                  borderLeft: "4px solid #8B2020",
                }}
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 20px",
                background: loading ? "#9E9D97" : COLORS.orange500,
                color: "white",
                border: "none",
                borderRadius: "999px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                opacity: loading ? 0.8 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.boxShadow =
                  "0 4px 14px rgba(245, 124, 0, 0.28)";
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = "none";
              }}
            >
              {loading ? "⏳ Analisando..." : "🔬 Analisar Exame"}
            </button>
          </form>
        ) : (
          /* Resultado */
          <div>
            <div
              style={{
                textAlign: "center",
                marginBottom: "30px",
                paddingBottom: "20px",
                borderBottom: "2px solid #E8E7E3",
              }}
            >
              <div style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>
                ✅ Análise Concluída
              </div>
              <div style={{ fontSize: "14px", color: "#9E9D97" }}>
                {analysis.patientName} • {analysis.analysisDate}
              </div>
            </div>

            {/* Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  background: "#FEECEB",
                  padding: "16px 12px",
                  borderRadius: "10px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{ fontSize: "24px", fontWeight: "700", color: "#8B2020" }}
                >
                  {analysis.results.filter((r) => r.criticidade.includes("CRÍTICO"))
                    .length}
                </div>
                <div style={{ fontSize: "11px", color: "#5F5E5A", marginTop: "4px" }}>
                  🔴 Crítico
                </div>
              </div>
              <div
                style={{
                  background: "#FFF8E1",
                  padding: "16px 12px",
                  borderRadius: "10px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{ fontSize: "24px", fontWeight: "700", color: "#7A5C00" }}
                >
                  {analysis.results.filter((r) => r.criticidade.includes("ATENÇÃO"))
                    .length}
                </div>
                <div style={{ fontSize: "11px", color: "#5F5E5A", marginTop: "4px" }}>
                  🟠 Atenção
                </div>
              </div>
              <div
                style={{
                  background: "#EAF6EF",
                  padding: "16px 12px",
                  borderRadius: "10px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{ fontSize: "24px", fontWeight: "700", color: "#1B6B3A" }}
                >
                  {analysis.results.filter((r) => r.criticidade.includes("NORMAL"))
                    .length}
                </div>
                <div style={{ fontSize: "11px", color: "#5F5E5A", marginTop: "4px" }}>
                  🟢 Normal
                </div>
              </div>
            </div>

            {/* Resumo */}
            {analysis.summary && (
              <div
                style={{
                  background: COLORS.teal50,
                  padding: "16px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  color: "#00838F",
                  marginBottom: "24px",
                  lineHeight: "1.6",
                }}
              >
                <strong style={{ color: COLORS.teal500 }}>📝 Resumo:</strong>
                <div style={{ marginTop: "8px" }}>{analysis.summary}</div>
              </div>
            )}

            {/* Tabela */}
            <div style={{ overflowX: "auto", marginBottom: "24px" }}>
              <table
                style={{
                  width: "100%",
                  fontSize: "12px",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr style={{ background: COLORS.teal500 }}>
                    <th
                      style={{
                        padding: "12px 8px",
                        color: "white",
                        textAlign: "left",
                        fontWeight: "600",
                      }}
                    >
                      Marcador
                    </th>
                    <th
                      style={{
                        padding: "12px 8px",
                        color: "white",
                        textAlign: "right",
                        fontWeight: "600",
                      }}
                    >
                      Resultado
                    </th>
                    <th
                      style={{
                        padding: "12px 8px",
                        color: "white",
                        textAlign: "right",
                        fontWeight: "600",
                      }}
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.results
                    .sort((a, b) => {
                      const order = {
                        "🔴 CRÍTICO": 0,
                        "🟠 ATENÇÃO MODERADA": 1,
                        "🟡 LIMÍTROFE": 2,
                        "🟢 NORMAL": 3,
                      };
                      return (order[a.criticidade] || 99) - (order[b.criticidade] || 99);
                    })
                    .map((result, idx) => (
                      <tr
                        key={idx}
                        style={{
                          background:
                            idx % 2 === 0 ? "white" : COLORS.neutral50,
                          borderBottom: "1px solid #E8E7E3",
                        }}
                      >
                        <td style={{ padding: "10px 8px", fontSize: "12px" }}>
                          <strong>{result.nome}</strong>
                          <div style={{ fontSize: "11px", color: "#9E9D97" }}>
                            Ideal: {result.minIdeal}-{result.maxIdeal}{" "}
                            {result.unidade}
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "10px 8px",
                            textAlign: "right",
                            fontWeight: "600",
                          }}
                        >
                          {result.resultado}
                          <br />
                          <span style={{ fontSize: "11px", color: "#9E9D97" }}>
                            {result.unidade}
                          </span>
                        </td>
                        <td
                          style={{ padding: "10px 8px", textAlign: "right" }}
                        >
                          {result.criticidade}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Alertas */}
            {analysis.alerts && analysis.alerts.length > 0 && (
              <div
                style={{
                  background: "#FEECEB",
                  border: "1px solid #E8C7C3",
                  borderRadius: "10px",
                  padding: "16px",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    fontWeight: "600",
                    color: "#8B2020",
                    marginBottom: "12px",
                  }}
                >
                  ⚠️ Alertas Clínicos
                </div>
                {analysis.alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    style={{
                      fontSize: "12px",
                      color: "#5F5E5A",
                      marginBottom: idx < analysis.alerts.length - 1 ? "8px" : "0",
                    }}
                  >
                    • {alert}
                  </div>
                ))}
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <button
                onClick={downloadPDF}
                style={{
                  padding: "12px 20px",
                  background: COLORS.orange500,
                  color: "white",
                  border: "none",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow =
                    "0 4px 14px rgba(245, 124, 0, 0.28)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = "none";
                }}
              >
                📥 Exportar PDF
              </button>
              <button
                onClick={() => {
                  setAnalysis(null);
                  setFile(null);
                  setError(null);
                }}
                style={{
                  padding: "12px 20px",
                  background: "white",
                  color: COLORS.teal500,
                  border: `1.5px solid ${COLORS.teal500}`,
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = COLORS.teal50;
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "white";
                }}
              >
                ↻ Novo Exame
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: "40px",
          fontSize: "12px",
          color: "#9E9D97",
        }}
      >
        <div>✔️ Seguro • ✔️ Rápido • ✔️ Inteligente</div>
        <div style={{ marginTop: "8px" }}>
          EloSaúde © 2024 • Medicina Funcional & Integrativa
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<EloSaudeAnalyzer />, document.getElementById("root"));

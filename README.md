# 🏥 EloSaúde Analyzer

Plataforma web para análise automática de exames laboratoriais com inteligência artificial.

---

## 🎯 O que é?

Uma aplicação segura e pronta para produção que:

- ✅ Recebe PDFs de exames de laboratório
- ✅ Extrai e analisa os resultados automaticamente com Claude AI
- ✅ Compara com tabela customizada de valores ideais EloSaúde
- ✅ Classifica criticidade dos resultados
- ✅ Gera relatório profissional em PDF
- ✅ **Sua chave de API fica 100% segura** no backend

---

## 🚀 Deploy Rápido (no Vercel)

**Leia o arquivo `DEPLOY_GUIA.md`** para instruções passo-a-passo.

Em resumo:
1. Push para GitHub
2. Conecte Vercel ao repositório
3. Configure `ANTHROPIC_API_KEY` como variável de ambiente
4. Deploy automático em 2-3 minutos

---

## 📂 Estrutura do Projeto

```
elosaude-analyzer/
├── api/
│   └── analyze.js           # Backend Node.js com Express
├── public/
│   ├── index.html           # HTML principal
│   └── app.jsx              # React App (interface)
├── package.json             # Dependências
├── vercel.json              # Config para deploy
├── .env.example             # Exemplo de variáveis
└── DEPLOY_GUIA.md          # Instruções completas
```

---

## 🔧 Desenvolvendo Localmente

### Setup

```bash
npm install
```

### Rodar servidor local

```bash
npm run dev
```

Acesse: `http://localhost:3000`

---

## 🎨 Interface

A interface segue o **design system EloSaúde** com:
- Cores oficiais (Laranja #F57C00, Teal #00ACC1)
- Tipografia (Playfair Display + DM Sans)
- Componentes profissionais e acessíveis

---

## 🔐 Segurança

- ✅ Chave da API no `.env` do servidor (nunca exposta)
- ✅ CORS configurado adequadamente
- ✅ Limite de tamanho de arquivo (50MB)
- ✅ Sem armazenamento de dados sensíveis
- ✅ Requisições POST seguras

---

## 📊 Protocolo de Análise

O sistema implementa os **5 passos obrigatórios** do protocolo EloSaúde:

1. **Extração** → Lê o PDF e extrai valores
2. **Análise** → Classifica criticidade (🔴 🟠 🟡 🟢)
3. **Relatório Clínico** → Para uso interno
4. **Alertas** → Identifica combinações críticas
5. **Relatório ao Paciente** → PDF profissional

---

## 📱 Uso

1. Acesse a URL deploiada
2. Digite o **nome do paciente**
3. Selecione o **PDF do exame**
4. Clique em **"Analisar"**
5. Veja resultados e **exporte como PDF**

---

## 🔄 Fluxo de Dados

```
PDF (Frontend)
    ↓
Upload (Base64)
    ↓
Backend Node.js
    ↓
Claude API (extração + análise)
    ↓
Classificação local (valores ideais)
    ↓
JSON Response
    ↓
Frontend exibe + permite exportar PDF
```

---

## 📦 Dependências

- **Express** - Framework web
- **Anthropic SDK** - Integração com Claude API
- **React** - Interface (carregado via CDN)
- **Babel** - JSX transpiling (via CDN)
- **CORS** - Requisições seguras

---

## 🆘 Troubleshooting

### Erro: "ANTHROPIC_API_KEY não definida"
- Verifique se você criou o arquivo `.env` na raiz
- Confirme que tem a variável no Vercel (Settings → Environment)

### Erro: "PDF inválido"
- Certifique-se que é um PDF válido
- Tente outro arquivo para testar

### Resposta lenta
- A primeira requisição pode levar 5-10s (cold start)
- Requisições subsequentes são mais rápidas

---

## 🚀 Melhorias Futuras

- [ ] Autenticação de usuários
- [ ] Histórico de análises
- [ ] Multi-idioma
- [ ] Integração com prontuário eletrônico
- [ ] API pública para terceiros

---

## 📄 Licença

Propriedade de EloSaúde — Medicina Funcional e Integrativa

---

## 👤 Desenvolvido por

Gerado com Claude AI — Assistente de Análise EloSaúde

---

**Dúvidas? Abra uma issue ou entre em contato com Eve Mendes!**

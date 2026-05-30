# 🚀 Guia de Deploy — EloSaúde Analyzer no Vercel

Você tem uma aplicação web profissional pronta para rodar fora do Claude.ai. Aqui está o guia **passo-a-passo** para hospedar no **Vercel** (gratuito e seguro).

---

## ✅ O que você terá no final

- ✔️ Uma URL pública tipo `https://seu-projeto.vercel.app`
- ✔️ Interface bonita com design EloSaúde
- ✔️ Qualquer pessoa pode acessar e fazer upload de PDFs
- ✔️ Sua chave da API fica **100% segura** no servidor
- ✔️ Deploy automático a cada atualização

---

## 📋 Pré-requisitos (5 minutos)

### 1. Crie uma conta Vercel (gratuito)
- Acesse: https://vercel.com
- Clique em **"Sign up"**
- Use GitHub, Google ou email

### 2. Tenha sua chave da API Anthropic pronta
- Vá em: https://console.anthropic.com/keys
- Copie sua chave `sk-ant-...`
- **Guarde com segurança** (não compartilhe!)

### 3. Tenha Git instalado
- Windows/Mac/Linux: https://git-scm.com/download

---

## 🔧 Configuração (10 minutos)

### Passo 1: Prepare os arquivos

1. **Crie uma pasta no seu computador:**
   ```bash
   mkdir elosaude-analyzer
   cd elosaude-analyzer
   ```

2. **Copie todos estes arquivos para a pasta:**
   - `package.json`
   - `api/analyze.js`
   - `public/index.html`
   - `public/app.jsx`
   - `vercel.json`
   - `.env.example`
   - `.gitignore`

3. **Crie um arquivo `.env`** (copie de `.env.example`):
   ```
   ANTHROPIC_API_KEY=sua_chave_sk-ant-aqui
   ```

4. **Estrutura final deve ser assim:**
   ```
   elosaude-analyzer/
   ├── api/
   │   └── analyze.js
   ├── public/
   │   ├── index.html
   │   └── app.jsx
   ├── package.json
   ├── vercel.json
   ├── .env
   ├── .env.example
   └── .gitignore
   ```

### Passo 2: Envie para o GitHub

1. **Instale Git e crie repositório:**
   ```bash
   git init
   git add .
   git commit -m "Inicial: EloSaúde Analyzer"
   ```

2. **Crie repositório no GitHub:**
   - Vá em: https://github.com/new
   - Nome: `elosaude-analyzer`
   - Não inicialize com README (deixe em branco)
   - Crie

3. **Envie o código:**
   ```bash
   git remote add origin https://github.com/seu-usuario/elosaude-analyzer.git
   git branch -M main
   git push -u origin main
   ```

---

## 🚀 Deploy no Vercel (2 minutos)

### Passo 1: Conecte GitHub ao Vercel

1. Vá em: https://vercel.com/new
2. Clique em **"Import Git Repository"**
3. Selecione **GitHub** e autorize
4. Escolha `elosaude-analyzer`
5. Clique em **Import**

### Passo 2: Configure as variáveis de ambiente

Na tela que aparecer:

1. Encontre **"Environment Variables"**
2. Clique para adicionar variável:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** Sua chave `sk-ant-...`
3. Clique em **"Deploy"**

Pronto! ⏳ Aguarde 2-3 minutos...

---

## ✅ Seu projeto está ao vivo!

Quando ver o botão **"Visit"**, clique nele ou acesse:
```
https://seu-projeto.vercel.app
```

---

## 📝 Como usar

1. Acesse a URL acima
2. Digite o **nome do paciente**
3. Selecione o **PDF do exame**
4. Clique em **"🔬 Analisar Exame"**
5. Veja os resultados e **exporte como PDF**

---

## 🔐 Segurança

✔️ A chave da API **nunca** aparece no frontend
✔️ As requisições são feitas **direto do servidor**
✔️ Os PDFs são **processados apenas uma vez**
✔️ Nenhum dado é armazenado

---

## 🆘 Erros Comuns

### "Chave da API inválida"
- Verifique se copiou certo em Vercel → Settings → Environment Variables
- Certifique-se que é a chave correta (`sk-ant-...`)

### "PDF não processa"
- O arquivo é válido? Tente outro PDF
- Está em português? OK, suporta qualquer idioma

### "Acesso negado ao GitHub"
- Autorize Vercel em: https://github.com/settings/applications
- Reconecte a aplicação

---

## 📱 Compartilhe com seu time!

Agora você pode compartilhar:
```
https://seu-projeto.vercel.app
```

Qualquer pessoa (enfermeira, paciente, clínica) pode usar!

---

## 🚀 Atualizações

Para atualizar o código:

```bash
# Edite os arquivos
# Faça commit
git add .
git commit -m "Descrição da mudança"
git push
```

Vercel **automaticamente redeploya** em 2 minutos!

---

## 💡 Próximos passos (opcional)

1. **Adicione autenticação** (apenas seu time acessa)
2. **Salve histórico** de análises (banco de dados)
3. **Domain customizado** (ex: analyzer.elosaude.com.br)
4. **Logo/imagens** da clínica

Quer ajuda com algum destes?

---

**Pronto! Sua aplicação está ao vivo e segura.** 🎉

Dúvidas? Entre em contato!

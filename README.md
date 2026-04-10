# MCU Tracker 🎬

Guia completo do Universo Cinematográfico Marvel — acompanhe tudo que já assistiu, avalie com estrelas e faça anotações pessoais.

**Acesse:** `https://seu-usuario.github.io/mcu-tracker`

---

## O que tem

- **87 obras** — Fases 1 a 6, incluindo séries Netflix canon e lançamentos de 2026/2027
- **Ordem de lançamento ou cronológica** — alterne com um clique
- **Filtro por tipo** — Filmes, Séries, Animações, Curtas, Especiais
- **Toggle Netflix** — inclua ou exclua as séries da Netflix
- **Marcar como assistido** — clique em qualquer obra
- **Avaliação de 1 a 5 estrelas** — diretamente na lista
- **Anotações pessoais** — campo de texto expansível por obra
- **Tudo salvo no navegador** — localStorage, sem servidor, sem conta
- **Impressão / PDF** — botão dedicado no topo

---

## Rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173/mcu-tracker/`

---

## Deploy no GitHub Pages

### Primeira vez

1. Crie um repositório no GitHub (pode ser público ou privado)
2. Renomeie o repositório ou ajuste o `base` em `vite.config.js`:
   ```js
   base: "/nome-do-seu-repo/",
   ```
3. Ative o GitHub Pages:
   - Vá em **Settings → Pages**
   - Em **Source**, selecione **GitHub Actions**
4. Faça push do código para a branch `main`
5. O deploy acontece automaticamente — acompanhe em **Actions**

### Deploys seguintes

Qualquer `push` para `main` dispara o deploy automaticamente.

---

## Estrutura do projeto

```
mcu-tracker/
├── src/
│   ├── App.jsx       ← componente principal + dataset
│   └── main.jsx      ← entrada do React
├── .github/
│   └── workflows/
│       └── deploy.yml ← GitHub Actions
├── index.html
├── package.json
└── vite.config.js    ← ajuste o base: aqui
```

---

## Dados

Verificados em Abril/2026 com base em Wikipedia, Marvel.com e Disney+.  
Sagas incluídas: **Infinity Saga** (Fases 1–3) e **Multiverse Saga** (Fases 4–6).

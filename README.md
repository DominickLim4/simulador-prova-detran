# Simulado DETRAN

Aplicação web para simulado da prova teórica do DETRAN, seguindo o formato de 30 questões, 60 minutos e aprovação com 21 acertos.

## Decisão de arquitetura

O projeto começou como monolito Next.js para manter o deploy gratuito e simples. O backend funcional da primeira versão está em `frontend/src/app/api`, com validação por Zod e banco de questões local em JSON. Também há um esqueleto Prisma em `backend/` para migrar histórico, respostas e questões para PostgreSQL/Supabase quando a persistência em banco for ativada.

## O que já está implementado

- Sorteio de prova com proporção oficial: 12 Legislação, 10 Direção Defensiva, 3 Primeiros Socorros, 3 Cidadania/Meio Ambiente e 2 Mecânica.
- Embaralhamento da ordem das questões e das alternativas.
- Correção sem enviar gabarito na geração da prova.
- Timer regressivo de 60 minutos com autoenvio.
- Resultado com aprovação/reprovação, explicações, links de estudo e revisão completa.
- Histórico local reabrindo provas antigas.
- Dashboard com KPIs, gráfico por categoria, evolução de pontuação e ranking de assuntos.
- Aba Estudar com links oficiais agrupados por categoria.
- PWA básico com manifest e service worker.
- Banco inicial com 160 questões em `frontend/src/data/questions.json`.

## Rodando localmente

```bash
cd frontend
npm install
npm run seed
npm run dev
```

Acesse `http://localhost:3000`.

## Scripts do frontend

```bash
npm run dev       # servidor de desenvolvimento
npm run build     # build de produção
npm run start     # serve o build
npm run lint      # ESLint
npm run seed      # regenera questions.json
```

## Backend/Prisma opcional

```bash
cd backend
npm install
cp .env.example .env
npm run db:migrate
npm run seed
```

O schema contém `Question`, `Exam` e `Answer`, alinhados ao documento de arquitetura.

## Deploy recomendado

Para a versão atual, publique somente o `frontend` na Vercel. Ele já contém as rotas `POST /api/exams` e `POST /api/exams/submit`, então não precisa de Render agora.

### 1. GitHub

```bash
git remote add origin https://github.com/SEU_USUARIO/prova-detran-aline.git
git push -u origin main
```

### 2. Vercel

1. Crie um novo projeto na Vercel importando o repositório do GitHub.
2. Em Root Directory, selecione `frontend`.
3. Framework Preset: Next.js.
4. Install Command: `npm install`.
5. Build Command: `npm run build`.
6. Output Directory: deixe vazio/default.
7. Environment Variables: nenhuma obrigatória nesta versão.
8. Clique em Deploy.

### 3. Banco opcional

Se quiser persistir histórico em banco no futuro, recomendo Supabase ou Neon antes de Render:

- Supabase: melhor se quiser Postgres + painel + APIs prontas.
- Neon: melhor se quiser apenas Postgres moderno para usar com Prisma.
- Render: bom para hospedar um backend Node/Fastify separado, mas não é necessário enquanto as APIs estiverem dentro do Next.js.

Quando o banco entrar, use `backend/prisma/schema.prisma` como base e troque o `localStorage` do frontend por chamadas persistidas.

## Fontes de estudo usadas

- CTB compilado: https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm
- Resolução CONTRAN 168/2004: https://www.gov.br/transportes/pt-br/centrais-de-conteudo/resolucao-contran-168-04-compilada-pdf/view
- Manuais Brasileiros de Sinalização: https://www.gov.br/transportes/pt-br/assuntos/transito/senatran/manuais-brasileiros-de-sinalizacao-de-transito
- Educação para o Trânsito PRF: https://www.gov.br/prf/pt-br/seguranca-viaria/educacao-para-o-transito
- SAMU 192: https://www.gov.br/saude/pt-br/composicao/saes/samu-192
- CONAMA: https://www.gov.br/mma/pt-br/composicao/conama

## Variáveis de ambiente

Veja `.env.example` na raiz e `backend/.env.example`.

Na primeira versão, o frontend não exige variáveis obrigatórias.

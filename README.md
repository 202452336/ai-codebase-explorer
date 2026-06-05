<div align="center">

# ⚡ AI Codebase Explorer

### *Explore, understand, and document any repository with AI that thinks like a senior engineer.*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Voyage AI](https://img.shields.io/badge/Voyage_AI-Embeddings-7C6AFF?style=for-the-badge)](https://voyageai.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br />

**Paste any GitHub URL → AI clones, reads every file, maps architecture, and lets you explore with natural language.**

[🚀 Live Demo](#) · [📖 Documentation](#installation) · [🐛 Report Bug](https://github.com/202452336/ai-codebase-explorer/issues) · [✨ Request Feature](https://github.com/202452336/ai-codebase-explorer/issues)

<br />

</div>

---

## 📸 Screenshots

| Overview | Explorer |
|----------|----------|
| ![Overview](https://placehold.co/600x340/0d0d0f/7c6aff?text=Repository+Overview) | ![Explorer](https://placehold.co/600x340/0d0d0f/00d4ff?text=File+Explorer) |

| AI Chat | Semantic Search |
|---------|----------------|
| ![Chat](https://placehold.co/600x340/0d0d0f/00ff88?text=AI+Chat+Interface) | ![Search](https://placehold.co/600x340/0d0d0f/ff6eb4?text=Semantic+Search) |

| Architecture View | README Generator |
|-------------------|-----------------|
| ![Architecture](https://placehold.co/600x340/0d0d0f/ffd93d?text=Architecture+View) | ![README](https://placehold.co/600x340/0d0d0f/ff8c42?text=README+Generator) |

---

## 🧠 What Is This?

**AI Codebase Explorer** is a full-stack developer intelligence platform. You give it a GitHub repository URL — it clones the repo, parses every file, generates vector embeddings, maps the architecture, and then gives you an intelligent AI assistant that truly *understands* the codebase.

It's like having a senior engineer who has read every line of code sitting next to you, ready to answer any question.

> **"Understanding a new codebase used to take days. This takes minutes."**

---

## ✨ Features

### 🔑 Core Features

| Feature | Description |
|---------|-------------|
| 🔗 **GitHub Clone** | Paste any public GitHub URL and the system clones and indexes it automatically |
| 📁 **File Explorer** | VS Code-style file tree with syntax-highlighted code viewer |
| 🧠 **AI File Explanation** | Click any file → AI explains purpose, functions, dependencies, flow, and quality score |
| 🔍 **Semantic Search** | Search by meaning, not keywords — *"where is JWT implemented?"* finds the right files |
| 💬 **Repo Chat** | Full conversational AI grounded in actual source code with source citations |
| 📝 **README Generator** | Auto-generates production-quality README.md from actual codebase content |
| 🏗️ **Architecture View** | Visualizes layers, data flow, design patterns, and tech stack |
| 📊 **Insights Dashboard** | Security score, maintainability score, strengths, risks, and recommendations |

### 🚀 Advanced AI Features

| Feature | Description |
|---------|-------------|
| 🧬 **RAG Pipeline** | Retrieval-Augmented Generation for context-accurate answers |
| 📦 **Vector Embeddings** | Voyage AI `voyage-code-3` — purpose-built for code semantic understanding |
| 🗂️ **Smart Chunking** | Overlap-aware text chunking preserves context across file boundaries |
| 📎 **Source Citations** | Every AI answer includes references to the exact files used |
| 🔁 **Cross-file Analysis** | AI understands how files relate to each other, not just individually |
| 🛡️ **Security Detection** | Highlights auth patterns, input validation issues, and risk areas |
| 🏷️ **Tech Stack Detection** | Automatically identifies React, Express, PostgreSQL, Docker, and 50+ more |

### 🎨 Developer Experience

| Feature | Description |
|---------|-------------|
| 🌙 **Dark Theme** | Premium dark UI inspired by Linear, Vercel, and Cursor |
| ⚡ **Background Processing** | Repo indexing happens async with live status updates |
| 📱 **Responsive** | Works on desktop and mobile |
| 🔐 **Firebase Auth** | Google Sign-In + Email/Password authentication |
| 💾 **Recent Repos** | Quick access to previously analyzed repositories |
| 🖼️ **Markdown Rendering** | AI responses render with full markdown, tables, and code blocks |

---

## 🏗️ Architecture

```mermaid
graph TD
    A[👤 User] -->|GitHub URL| B[React Frontend]
    B -->|REST API + Firebase JWT| C[Express Backend]
    C -->|Clone & Parse| D[GitHub Service]
    D -->|File Contents| E[AI Service - Groq/Llama]
    D -->|File Chunks| F[Embedding Service]
    F -->|voyage-code-3| G[Voyage AI API]
    G -->|768-dim Vectors| H[(PostgreSQL + pgvector)]
    E -->|Architecture JSON| H
    B -->|Search Query| C
    C -->|Vector Similarity| H
    H -->|Top-K Chunks| E
    E -->|Grounded Answer| B
```

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                       │
│  Overview │ Explorer │ Architecture │ Insights │ Chat    │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS + Firebase JWT
┌──────────────────────▼──────────────────────────────────┐
│                   Express.js API                         │
│  /repos  │  /explain  │  /search  │  /chat  │  /readme  │
└────┬─────────────┬───────────────────────────────────────┘
     │             │
┌────▼───┐   ┌─────▼──────────────────────────────────────┐
│ GitHub  │   │              AI Pipeline                    │
│ Service │   │  Groq (Llama 3.3 70B) + Voyage Embeddings  │
│ Clone   │   └─────────────────┬──────────────────────────┘
│ Parse   │                     │
└────┬────┘             ┌───────▼───────┐
     │                  │  PostgreSQL   │
     └──────────────────►  + pgvector   │
                        │  (Supabase)   │
                        └───────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose | Version |
|-----------|---------|---------|
| React | UI framework | 19.x |
| Vite | Build tool & dev server | 8.x |
| Firebase | Authentication | 12.x |
| Custom CSS | Styling (no framework) | — |
| Highlight.js | Syntax highlighting | CDN |

### Backend
| Technology | Purpose | Version |
|-----------|---------|---------|
| Node.js | Runtime | 22.x |
| Express.js | API framework | 5.x |
| pg | PostgreSQL client | 8.x |
| simple-git | Git clone operations | 3.x |
| nodemon | Dev hot reload | 3.x |

### AI & Embeddings
| Technology | Purpose |
|-----------|---------|
| Groq (Llama 3.3 70B) | LLM for chat, explain, readme, architecture |
| Voyage AI voyage-code-3 | Code-optimized vector embeddings |
| pgvector | Vector similarity search in PostgreSQL |
| RAG Pipeline | Retrieval-augmented generation |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| Supabase | PostgreSQL + pgvector hosting |
| Firebase Auth | User authentication |
| GitHub API | Repository cloning |

---

## 📁 Project Structure

```
ai-codebase-explorer/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # PostgreSQL connection pool
│   │   │   └── firebase.js        # Firebase Admin SDK setup
│   │   ├── controllers/
│   │   │   └── repoController.js  # All API route handlers
│   │   ├── middleware/
│   │   │   └── authMiddleware.js  # Firebase JWT verification
│   │   ├── migrations/
│   │   │   └── schema.sql         # Database schema (pgvector)
│   │   ├── routes/
│   │   │   └── repoRoutes.js      # Express route definitions
│   │   ├── services/
│   │   │   ├── aiService.js       # Groq LLM: explain, chat, readme, arch
│   │   │   ├── embeddingService.js # Voyage AI embeddings + vector search
│   │   │   └── githubService.js   # Clone, parse, detect tech stack
│   │   └── index.js               # Express server entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIPanel.jsx        # File intelligence sidebar
│   │   │   ├── ChatPanel.jsx      # Chat UI with markdown renderer
│   │   │   ├── CodeViewer.jsx     # Syntax-highlighted code viewer
│   │   │   ├── FileTree.jsx       # VS Code-style file tree
│   │   │   ├── ReadmePanel.jsx    # README generator & preview
│   │   │   └── SearchPanel.jsx    # Semantic search UI
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Firebase auth state
│   │   ├── pages/
│   │   │   ├── HomePage.jsx       # Landing + repo URL input
│   │   │   ├── LoginPage.jsx      # Split-screen auth page
│   │   │   ├── ProcessingPage.jsx # Repo indexing progress
│   │   │   └── ExplorerPage.jsx   # Main 7-tab explorer
│   │   ├── services/
│   │   │   ├── api.js             # All backend API calls
│   │   │   └── firebase.js        # Firebase client config
│   │   ├── App.jsx                # Root component + routing
│   │   ├── index.css              # Full design system CSS
│   │   └── main.jsx               # React entry point
│   └── package.json
│
└── README.md
```

---

## ⚙️ How It Works

```
1. User pastes GitHub URL
         ↓
2. Backend clones repo with simple-git
         ↓
3. All files are read, parsed, and stored in PostgreSQL
         ↓
4. Tech stack detected from package.json, requirements.txt, etc.
         ↓
5. Architecture analyzed by Groq Llama 3.3 70B
         ↓
6. Files chunked (800 char chunks, 100 char overlap)
         ↓
7. Voyage AI voyage-code-3 generates 1024-dim vectors per chunk
         ↓
8. Vectors stored in PostgreSQL via pgvector
         ↓
9. Repo status → "ready" — user can now explore
         ↓
10. User asks question → query embedded → top-K chunks retrieved
         ↓
11. Chunks + question sent to Groq → structured markdown answer returned
         ↓
12. Response rendered with full markdown, tables, code blocks
```

---

## 🚀 Installation

### Prerequisites

- Node.js 18+
- PostgreSQL database with pgvector extension (Supabase free tier works perfectly)
- Firebase project (for authentication)
- Groq API key (free at console.groq.com)
- Voyage AI API key (free at dash.voyageai.com)

### 1. Clone the repository

```bash
git clone https://github.com/202452336/ai-codebase-explorer.git
cd ai-codebase-explorer
```

### 2. Set up the database

Run the schema in your PostgreSQL database (Supabase SQL editor):

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE repos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    github_url TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'cloning',
    tech_stack JSONB DEFAULT '[]',
    summary TEXT,
    architecture TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    repo_id UUID REFERENCES repos(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    content TEXT,
    language TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE embeddings (
    id SERIAL PRIMARY KEY,
    repo_id UUID REFERENCES repos(id) ON DELETE CASCADE,
    file_id INTEGER REFERENCES files(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    chunk_index INTEGER DEFAULT 0,
    embedding vector(1024),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX embeddings_vector_idx ON embeddings
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
```

### 3. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

### 4. Set up the frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Firebase config
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
FRONTEND_URL=http://localhost:5173

# Supabase PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/postgres

# AI Keys
GROQ_API_KEY=your_groq_key          # console.groq.com — free
VOYAGE_API_KEY=your_voyage_key      # dash.voyageai.com — free
GEMINI_API_KEY=your_gemini_key      # aistudio.google.com — free

# Firebase Admin (for auth verification)
FIREBASE_SERVICE_ACCOUNT=./firebase-service-account.json

# Temp path for cloning repos
REPOS_CLONE_PATH=/tmp/ai-explorer-repos
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 📡 API Reference

All routes require `Authorization: Bearer <firebase-id-token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/repos/clone` | Clone & index a GitHub repository |
| `GET` | `/api/repos/:id/status` | Get repo processing status + file count |
| `GET` | `/api/repos/:id/files` | List all files in the repo |
| `GET` | `/api/repos/:id/files/:fileId` | Get file content |
| `POST` | `/api/repos/:id/explain` | AI explanation of a specific file |
| `POST` | `/api/repos/:id/search` | Semantic search across the codebase |
| `POST` | `/api/repos/:id/chat` | Chat with the repository |
| `POST` | `/api/repos/:id/readme` | Generate a README.md |
| `GET` | `/api/repos/:id/architecture` | Get architecture analysis |

### Example: Chat with a repo

```bash
curl -X POST http://localhost:5000/api/repos/{repoId}/chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"message": "How does authentication work in this project?"}'
```

```json
{
  "answer": "## Answer\n\n### Quick Summary\nAuthentication uses JWT tokens via Passport.js...",
  "sourcesUsed": ["src/middleware/auth.js", "src/config/passport.js"]
}
```

---

## ⚡ Performance

- **Bulk DB inserts** — all files inserted in a single query (not one per file)
- **Batch embeddings** — up to 128 chunks per API request
- **pgvector IVFFlat index** — sub-millisecond vector similarity search
- **Background processing** — repo indexing is async, frontend polls for status
- **Chunking strategy** — 800-char chunks with 100-char overlap for context preservation

---

## 🛡️ Security

- All API routes protected with Firebase JWT middleware
- `.env` files excluded from git via `.gitignore`
- Service account key excluded from git
- Input validation on all endpoints
- Parameterized SQL queries (no injection risk)
- CORS restricted to frontend URL only

---

## 🗺️ Roadmap

- [ ] Multi-repository chat (talk to multiple repos at once)
- [ ] PR review assistant
- [ ] Team collaboration & shared workspaces
- [ ] Folder-level AI explanations
- [ ] Code generation from natural language
- [ ] CI/CD integration (GitHub Actions analysis)
- [ ] Multi-model support (Claude, GPT-4, Gemini)
- [ ] Private repository support (OAuth token)
- [ ] Export analysis as PDF report
- [ ] VS Code extension

---

## 💼 Use Cases

| Persona | Use Case |
|---------|----------|
| 🧑‍💻 **New Developer** | Onboard to a new codebase in minutes instead of days |
| 🔍 **Open Source Contributor** | Understand project structure before making a PR |
| 👨‍💼 **Tech Lead** | Quickly audit code quality and architecture |
| 🎓 **Student** | Learn how real production codebases are structured |
| 🧪 **Code Reviewer** | Get AI-powered insights before reviewing a PR |
| 📄 **Documentation Writer** | Auto-generate accurate technical documentation |

---

## 🏆 Why Recruiters Love This Project

This project demonstrates the full stack of modern software engineering:

| Skill | Evidence |
|-------|---------|
| **Full-Stack Engineering** | React frontend + Node.js/Express backend + PostgreSQL database |
| **AI/ML Integration** | RAG pipeline, vector embeddings, LLM prompt engineering |
| **System Design** | Async background processing, polling, bulk DB operations |
| **Developer Tooling** | Solves a real problem developers face daily |
| **Security** | JWT auth, parameterized queries, env var management |
| **Code Quality** | Clean architecture, separation of concerns, modular services |
| **Product Thinking** | 7-tab UX designed around developer cognitive load |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create your feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes using conventional commits
   ```bash
   git commit -m "feat: add multi-repo chat support"
   ```
4. Push to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request

Please make sure your PR:
- Includes a clear description of what changed and why
- Doesn't break existing functionality
- Follows the existing code style

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## 👤 Author

Built by **Thuppathi Nikitha**

---

<div align="center">

**If this project helped you, give it a ⭐ — it means a lot!**

*Built with ❤️ using React, Node.js, Groq, Voyage AI, and PostgreSQL*

</div>

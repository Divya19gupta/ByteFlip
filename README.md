# 🚀 ByteFlip

> **Flip through DSA, not your notes.** 📚⚡

A personal DSA revision tool that helps you **track solved problems**, **revise them as flashcards**, and **get AI-generated hints** whenever you're stuck.

🌐 **Live app:** **[ByteFlip](https://byte-flip.vercel.app/)**

---

## ✨ Features

- 📚 **305 DSA problems** across **13 topics** (Arrays, Graphs, DP, Trees, and more), each including:
  - Brute-force approach
  - Optimal approach
  - Time & space complexity
  - The key trick 💡

- ✅ **Track solved problems**
  - Tick problems off as you solve them
  - Organized by topic
  - See your progress at a glance with the ByteMeter 📈

- 🔄 **Revision sessions**
  - Solved problems enter a shuffled flashcard queue
  - Reveal solutions progressively:
    - 🥊 Brute Force
    - ⚡ Optimal
    - ⏱️ Complexity
    - 💡 Key Trick
  - Rate your confidence after each problem
  - Resume sessions anytime from where you left off

- 🤖 **AI hints**
  - Need a nudge? (Not the solution 😄)
  - ByteFlip searches for semantically similar problems using vector search
  - Gemini then generates a short, spoiler-free hint to point you in the right direction

---

## 🛠️ Tech Stack

- ⚡ **Backend:** FastAPI (Python)
- ⚛️ **Frontend:** React + Vite
- 🧠 **Vector Search:** ChromaDB + Gemini Embeddings (`gemini-embedding-001`)
- 🤖 **AI Hints:** Gemini (`gemini-2.5-flash`)
- 💾 **Storage:** Flat JSON files (`problems.json`, `solved.json`, `session.json`) — no database
- ☁️ **Hosting:** Render (backend) + Vercel (frontend)

---

## 📁 Project Structure

```text
ByteFlip/
├── backend/
│   ├── main.py            # FastAPI app: all API endpoints
│   ├── embeddings.py      # Generates embeddings for all problems
│   ├── requirements.txt
│   ├── problems.json      # The 305-problem dataset
│   ├── solved.json        # Solved problem IDs (auto-created)
│   ├── session.json       # Revision session state (auto-created)
│   └── chroma_db/         # Vector database
└── frontend/
    └── src/
        ├── pages/         # HomePage, ProblemsPage, RevisionPage
        └── components/    # Navbar, PageHeader, ByteMeter
```

### 🤔 Why is `chroma_db/` committed?

Unlike `solved.json` and `session.json`, the vector database never changes unless the problem set changes.

Generating embeddings requires **~300 Gemini API calls**, which is slow and rate-limited on the free tier. Rather than rebuilding them on every deployment, ByteFlip simply loads the precomputed database.

Meanwhile:

- 📝 `solved.json` stores your solved problems
- 🔄 `session.json` stores your revision progress

These are runtime files, so they're gitignored and recreated automatically when needed.

---

## 🚀 Setup

### Backend

```bash
cd backend
python -m venv ../venv
source ../venv/bin/activate      # Windows: ..\venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file:

```env
GEMINI_API_KEY=your_key_here
```

If `chroma_db/` doesn't exist (for example, after editing `problems.json`), generate it once:

```bash
python embeddings.py
```

⏳ This takes a few minutes since embeddings are created in batches to stay within Gemini's free-tier rate limits.

Run the backend:

```bash
uvicorn main:app --reload
```

Backend runs at:

```
http://localhost:8000
```

On first launch, `solved.json` and `session.json` are created automatically if missing.

---

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 🔑 Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `GEMINI_API_KEY` | `backend/.env` | Used for embeddings and AI hints |
| `VITE_API_URL` | `frontend/.env` | Backend URL (`localhost` locally or your Render deployment) |

---

## ☁️ Deployment

### Backend (Render)

- 📂 Root directory: `backend`
- 📦 Build command:
  ```bash
  pip install -r requirements.txt
  ```
- ▶️ Start command:
  ```bash
  uvicorn main:app --host 0.0.0.0 --port $PORT
  ```
- 🔑 Environment variable:
  - `GEMINI_API_KEY`

### Frontend (Vercel)

- 📂 Root directory: `frontend`
- ⚛️ Framework preset: **Vite**
- 🔑 Environment variable:
  - `VITE_API_URL` → Your deployed Render backend URL

---

## 🙏 Acknowledgments

The problem set (titles, categories, and approaches) is based on **Striver's A2Z DSA Sheet**.

Huge thanks to **Striver** for curating one of the best DSA roadmaps out there. ❤️

ByteFlip simply wraps it in a flashcard-style revision workflow with AI-assisted hints.

---

## ⚠️ Known Limitations

- 📄 Uses flat JSON files instead of a database.
  - Perfect for personal use.
  - Not suitable for multiple concurrent users.

- 🔄 Render's free tier uses ephemeral storage.
  - `solved.json` and `session.json` reset after redeployments.
  - `chroma_db/` is unaffected because it's committed to the repository.

- 😴 The backend sleeps after inactivity on Render's free tier.
  - The first request may take **~30 seconds** while the server wakes up.

- 🔓 No authentication.
  - ByteFlip is designed for a single user.

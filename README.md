# EventSaathi AI (इवेंटसाथी AI / ઈવેન્ટસાથી AI)
> **PromptWars Challenge 5: GenAI-Powered Celebration & Event Planner**  
> *Plan memorable weddings, birthday parties, and community celebrations within budget, with zero stress and precision AI guidance.*

---

## 🌟 Overview & Problem Statement

Planning celebrations—especially culturally rich Indian weddings, milestone birthdays, and community festivals—is frequently fragmented across chaotic spreadsheets, messaging apps, and handwritten notes. Organizers struggle with:
- **Unexpected budget overruns** and lack of category-level cost transparency.
- **Missed preparation deadlines** due to static to-do lists that don't adapt to milestones.
- **Language barriers** where planning tools are English-only and fail to support regional cultural traditions.
- **Brittle AI assistants** that produce plain chatbot text instead of actionable, editable, database-persisted schedules.

**EventSaathi AI** solves this by providing an end-to-end celebration planning assistant that synthesizes personalized event themes, decimal-safe budget breakdowns, interactive preparation timelines, and vendor comparison workspaces in **English, Hindi (हिंदी), and Gujarati (ગુજરાતી)**—backed by a resilient dual-engine architecture (Google Gemini 1.5 Flash + Deterministic Offline Fallback Planner).

---

## 🎯 Key Capabilities & Differentiators

| Feature | Description |
| :--- | :--- |
| **Multilingual Native Planning** | Fully localized interface and planner templates for **English**, **हिंदी**, and **ગુજરાતી**. |
| **Budget Intelligence** | Decimal-safe arithmetic, percentage allocations, estimated vs. actual tracking, over-budget warnings, and formula-injection-safe CSV export. |
| **Interactive Timelines** | Milestone-driven preparation checklists with priority badges (High/Medium/Low), due dates, completion percentages, and persistent database state. |
| **Transparent Vendor Workspace** | Vendor tracking across Venue, Catering, Decoration, Photography, Entertainment, Rentals, and custom categories with quotation comparisons and criteria checklists. |
| **Dual AI & Fallback Engine** | Connects to **Google Gemini 1.5 Flash** for generative ideas, and automatically switches to an intelligent deterministic rules engine when offline or when no API key is provided. |
| **Enterprise Security Standards** | Server-side API key isolation, CORS restrictions, 2MB request payload limits, cross-event access prevention, and spreadsheet formula injection sanitization. |

---

## 🏗️ System Architecture

```text
+-------------------------------------------------------------------------+
|                          EventSaathi AI Architecture                     |
+-------------------------------------------------------------------------+

  [ Browser Client (Desktop / Tablet / Mobile) ]
       │
       ▼  HTTP / REST (JSON)
  +───────────────────────────────────────────────────────────────+
  |                   FastAPI Backend (Port 8000)                |
  |  - CORS Security Middleware (Restricted Origins)             |
  |  - 2MB Request Payload Size Limiting Middleware              |
  |  - Pydantic v2 Request & Response Validation                 |
  +───────────────────────────────────────────────────────────────+
       │                            │
       ▼                            ▼
  [ API Routers ]             [ Planning Engine Adapter ]
  ├── /api/health             ├── Google Gemini 1.5 Flash REST API
  ├── /api/events             └── Deterministic Multilingual Fallback
  ├── /api/budget                 (100% offline & keyless reliability)
  ├── /api/tasks
  └── /api/vendors
       │
       ▼  SQLAlchemy 2.0 ORM (Parameterized Queries & Cascade Deletes)
  +───────────────────────────────────────────────────────────────+
  |              SQLite Database (eventsaathi.db)                 |
  |  - Events Table (UUID PK, JSON schedule, metadata)            |
  |  - BudgetItems Table (Category, estimated, actual, is_paid)   |
  |  - Tasks Table (Title, priority, milestone, status)           |
  |  - VendorRecords Table (Category, quotes, criteria, status)   |
  +───────────────────────────────────────────────────────────────+
```

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Canvas Confetti.
- **Backend**: Python 3.12+, FastAPI, SQLAlchemy 2.0, Pydantic v2, HTTPX, SQLite.
- **Testing**: Pytest & pytest-asyncio (Backend), Vitest & React Testing Library (Frontend).
- **AI Provider**: Google Gemini API (`gemini-1.5-flash`) with automatic deterministic fallback.

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Python 3.12+
- Node.js v18+ and npm

### 1. Clone & Configure Environment
```bash
git clone https://github.com/your-username/eventsaathi-ai.git
cd eventsaathi-ai
cp .env.example .env
```
*(Note: Leaving `GEMINI_API_KEY` empty in `.env` automatically activates the deterministic offline fallback planner, ensuring 100% functional demonstrations without external API dependencies).*

---

### 2. Backend Setup & Run
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Run backend server (starts on http://localhost:8000)
python backend/run.py
```
Verify backend health:
```bash
curl http://localhost:8000/api/health
```

---

### 3. Frontend Setup & Run
In a second terminal:
```bash
cd frontend

# Install dependencies
npm install

# Start development server (starts on http://127.0.0.1:5173)
npm run dev
```

Open `http://127.0.0.1:5173/` in your browser.

---

## 🧪 Running the Test Suites

### Backend Unit & Integration Tests (18 tests)
```bash
python -m pytest backend/tests
```
Verifies:
- Event creation, updates, and validation.
- Budget calculations, negative value validation, and over-budget alerts.
- Timeline task status toggles, milestone filtering, and progress percentages.
- Vendor quotation tracking and status updates.
- Multilingual fallback engine accuracy across English, Hindi, and Gujarati.
- Cross-event boundary access protection (403 Forbidden).
- Spreadsheet formula injection sanitization.
- Health status and AI provider resilience.

### End-to-End Live Workflow Test
With the backend running:
```bash
python backend/tests/test_live_demo.py
```

### Frontend Tests (Vitest)
```bash
cd frontend
npm run test
```

### Production Build & Linting Check
```bash
cd frontend
npm run build
npm run lint
```

---

## 📋 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System status, database health, and AI engine status |
| `POST` | `/api/events` | Create a new celebration plan |
| `GET` | `/api/events` | List all saved events with summary stats |
| `GET` | `/api/events/{id}` | Retrieve full celebration master details |
| `PATCH`| `/api/events/{id}` | Update event parameters |
| `DELETE`| `/api/events/{id}`| Delete event and cascading budget/tasks/vendors |
| `POST` | `/api/events/{id}/generate-plan` | Generate or refresh AI/fallback master plan |
| `GET` | `/api/events/{id}/budget` | Get budget totals, category splits, and items |
| `POST` | `/api/events/{id}/budget/items` | Add custom expense item |
| `PATCH`| `/api/events/{id}/budget/items/{item_id}` | Edit expense item |
| `DELETE`| `/api/events/{id}/budget/items/{item_id}`| Remove expense item |
| `GET` | `/api/events/{id}/budget/export-csv` | Export sanitized budget report to CSV |
| `GET` | `/api/events/{id}/tasks` | Get timeline tasks with status/priority filters |
| `POST` | `/api/events/{id}/tasks` | Add task to interactive timeline |
| `PATCH`| `/api/events/{id}/tasks/{task_id}` | Update task status or due date |
| `DELETE`| `/api/events/{id}/tasks/{task_id}` | Delete task |
| `GET` | `/api/events/{id}/vendors` | List vendor quotes and comparison criteria |
| `POST` | `/api/events/{id}/vendors` | Add vendor record and quotation |
| `PATCH`| `/api/events/{id}/vendors/{vendor_id}` | Update vendor quote or booking status |
| `DELETE`| `/api/events/{id}/vendors/{vendor_id}` | Remove vendor record |

---

## 🔒 Security Architecture

1. **Zero Client Secrets**: The frontend contains zero AI credentials. All API communication occurs server-side.
2. **Spreadsheet Formula Injection Mitigation (CWE-1236)**: User-provided text fields starting with formula trigger characters (`=`, `+`, `-`, `@`, `\t`, `\r`) are sanitized by prepending a single quote (`'`), preventing malicious execution in Excel, Google Sheets, or LibreOffice.
3. **Cross-Event Data Isolation**: All nested resource modifications verify that the target entity matches the path's `event_id`, returning `403 Forbidden` if mismatched.
4. **Denial-of-Service Defense**: Inbound HTTP requests exceeding 2MB are rejected with `413 Payload Too Large`.
5. **Decimal-Safe Financial Arithmetic**: Monetary calculations are computed using rounded 2-decimal arithmetic; negative budget amounts are rejected during Pydantic schema validation.

---

## ☁️ Deployment Guide

### Frontend (Vercel)
1. Link your GitHub repository in the Vercel dashboard.
2. Set root directory to `frontend`.
3. Set build command to `npm run build` and output directory to `dist`.
4. Configure environment variable: `VITE_API_URL=https://your-backend-service.com`.

### Backend (Render / Railway / Fly.io)
1. Deploy as a Python web service.
2. Start command: `python backend/run.py` or `uvicorn backend.app.main:app --host 0.0.0.0 --port 8000`.
3. Set environment variables:
   - `CORS_ORIGINS=https://your-frontend.vercel.app`
   - `GEMINI_API_KEY=your_gemini_api_key` (optional; falls back safely if omitted).

---

## 📄 License
MIT License. Built for PromptWars Challenge 5.

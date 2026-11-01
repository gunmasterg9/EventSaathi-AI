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

### Windows one-click start / stop

For temporary local AI testing, use **run-ollama.bat**. It restarts this project's
servers with `AI_PROVIDER=ollama` without changing `.env`. Ollama must already be
running at `http://127.0.0.1:11434` with the configured model installed; the default
is `qwen3-coder:30b`. Set `OLLAMA_MODEL` before launching to choose another model.
The app sends its event brief to Ollama's local `/api/chat` endpoint, requests
structured JSON, validates it, and labels successful plans **Local AI (Ollama)**.
If generation fails or exceeds the 180-second default timeout, it falls back and
labels the plan accordingly. Selecting Ollama in Settings does not prove generation
succeeded; check the plan badge.

Use `stop.bat`, then `run.bat`, to return to your normal configured provider.
Ollama itself is managed separately and is not stopped by `stop.bat`.

After installing the dependencies, double-click `run.bat` in the project root.
It starts the backend and frontend in the background and prints the app address:
http://127.0.0.1:5173/. Double-click `stop.bat` to stop both servers.
Closing the launcher window leaves the servers running. Saved events remain in
the database when stopped.

The launcher uses `.venv\Scripts\python.exe` and Node.js from PATH. For first-time
Windows setup, run these commands from the project root:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
cd frontend
npm.cmd ci
```

Logs are saved in `.runtime`. The stop script verifies recorded process identities
before stopping them; it does not kill every Node/Python process or an unrelated
application using the same ports. Both scripts accept `--no-pause` for terminal use.

### Manual backend startup
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

### Backend Unit & Integration Tests (60 tests)
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

### Conversational AI planner

Click **AI chat planner** at the bottom right, even before creating an event.
Describe the celebration in English, Hindi, or Gujarati. The assistant collects
the name, type, city, headcount and budget in INR, and prepares a structured draft.
Follow-up messages can correct the brief. Choose **Review details & create plan**
to open the prefilled wizard; review its fields and explicitly submit to save the
event and generate its plan. Chat itself never writes event records.

Chat uses the selected Ollama/Gemini provider and reports errors if AI is
unavailable; it does not disguise rules-based replies as AI. Use **Use event form**
for the normal fallback-capable workflow. Chat history is held in browser memory
only and resets when closed. Each conversation accepts up to 10 user turns,
3,000 characters per message. User messages are sent to the configured AI provider.
Endpoint: `POST /api/chat` with `messages` and `language`.

### Operational tools

Open **Services & feedback** to add editable timeline checklists for guest
hospitality, travel/accommodation, registration/check-in, hybrid streaming, and
event-day coordination. Each bundle adds three tasks; reapplying an unchanged
bundle skips existing tasks. Tasks remain editable/removable in Timeline.
Templates currently use English; the workspace controls support all three UI languages.

Record actual client/guest feedback with a 1–5 rating and comment. The workspace
shows response count and average rating, supports removal, and includes entries
in JSON backups. Feedback is private organizer-recorded data, not verified reviews.
No third-party testimonials are copied into the product.

These additions were informed by [MICE Ideas](https://miceideas.in/) service
categories and themes of coordination/hospitality in
[7X Weddings testimonials](https://7xweddings.com/testimonials).
There is no affiliation or integration with either company. Checklists do not book
travel, register attendees, or operate a livestream automatically.

Endpoints: `POST /api/events/{id}/service-checklists` with a `bundle` value
(`hospitality`, `travel`, `registration`, `hybrid`, `coordination`);
`GET/POST /api/events/{id}/feedback`; `DELETE /api/events/{id}/feedback/{feedback_id}`.

### Guest workspace

Open **Guests & RSVP** from the navigation or dashboard to add and edit guest or
family invitations, party sizes, organizer-recorded RSVP responses, dietary needs,
and notes. Search by name/phone and filter by response. Attendance totals count
people, and confirmed attendance above the planned guest count triggers a warning.
Guest CSV exports sanitize spreadsheet formulas; JSON event backups include guests.
The new guest table is created automatically at backend startup.

API: `GET/POST /api/events/{id}/guests`,
`PATCH/DELETE /api/events/{id}/guests/{guest_id}`, and
`GET /api/events/{id}/guests/export-csv`.

See [HACKATHON_DEMO.md](HACKATHON_DEMO.md) for a three-minute presentation outline.

### Preserving your work

Regenerating a plan refreshes its summary, theme, ideas, preparation steps, and
event-day schedule. Existing expenses, payments, tasks, completion status, and
vendor contacts remain unchanged. Initial generation populates empty workspace
sections only; subsequent regeneration does not recreate deleted items.

Use **Download event backup** in the plan view to save a JSON snapshot containing
the event, budget entries, tasks, and vendors. The download is also available at
`GET /api/events/{id}/export-json`. Import/restore is not currently implemented.

This application currently uses a shared workspace without user authentication.
Event boundary checks prevent mismatched nested operations; they do not provide
user-level access control. Add authentication and event ownership before hosting
private event data on a public server.

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

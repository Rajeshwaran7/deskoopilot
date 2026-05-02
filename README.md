# Compliance Copilot for HR (India)

A production-ready MVP scaffold for an Indian HR compliance SaaS using:

- **Frontend:** Next.js App Router, TypeScript, Tailwind CSS
- **Backend:** Node.js + TypeScript + Express
- **Database:** MongoDB with Mongoose
- **AI:** OpenAI / Azure OpenAI abstraction
- **Rule engine:** JSON-driven compliance rules

## Folder structure

- `backend/` — Express API, Mongoose models, AI service, rule engine, controllers
- `frontend/` — Next.js app pages, TipTap editor, compliance side panel

## Getting started

### Backend

1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and configure `MONGO_URI` and `OPENAI_API_KEY`
4. `npm run seed` (to add sample templates and compliance rules)
5. `npm run dev`

### Frontend

1. `cd frontend`
2. `npm install`
3. Copy `.env.example` to `.env.local`
4. `npm run dev`

## API endpoints

- `POST /api/templates`
- `GET /api/templates`
- `POST /api/documents/generate`
- `POST /api/documents/ai-edit`
- `POST /api/documents/analyze`

## Next steps

- Add auth and user management
- Seed compliance rules for Indian states
- Add export-to-PDF/DOCX support
- Wire frontend form actions to backend APIs

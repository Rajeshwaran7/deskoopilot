# Compliance Copilot for HR (India)

MVP for Indian HR compliance: templates, document generation, rule engine (PF / ESI / Shops & Establishments seeds), AI assists, versioning, approval flow, and audit logs.

- **Frontend:** Next.js App Router, TypeScript, Tailwind, TipTap
- **Backend:** Express, TypeScript, Mongoose
- **AI:** OpenAI or Azure OpenAI (mock mode when key is missing or placeholder)

## Folder structure

- `backend/` — API, models, rule engine, AI provider, seed data
- `frontend/` — Dashboard, templates, document workspace, clause library

## Getting started

### Backend

1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` — set `MONGO_URI`, optional `OPENAI_API_KEY`, optional `DEFAULT_USER_ID` (must match seed demo user if you change it)
4. `npm run seed`
5. `npm run dev` (default `http://localhost:4000`)

### Frontend

1. `cd frontend`
2. `npm install`
3. Copy `.env.example` to `.env.local` — set `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_DEFAULT_USER_ID` (same 24-char id as backend demo user)
4. `npm run dev` (default `http://localhost:3000`)

## Functional requirements (wired)

| ID | Requirement | Backend | Frontend |
|----|----------------|---------|----------|
| FR-1 | List / create templates | `GET/POST /api/templates` | `/templates` |
| FR-2 | Load template by id | `GET /api/templates/:id` | `/documents/[templateId]` (variable form) |
| FR-3 | Demo user id (valid ObjectId) | `DEFAULT_USER_ID`, seed `User` | `getDefaultUserId()` in `lib/user.ts` |
| FR-4 | Generate document from template + variables | `POST /api/documents/generate` | Generate → `/documents/edit/[id]` |
| FR-5 | List / get / delete documents | `GET /api/documents`, `GET /api/documents/:id`, `DELETE /api/documents/:id` | `/dashboard` |
| FR-6 | Persist manual editor HTML (“Save draft”) | `PATCH /api/documents/:id` body `{ generatedContent }` — re-runs rules, version snapshot `manual` | TipTap **Save draft** |
| FR-7 | AI edit | `POST /api/documents/ai-edit` | **Apply AI edit** |
| FR-8 | Merge AI + rule analysis | `POST /api/documents/analyze` | **Re-analyze** |
| FR-9 | Clause library (state / category) | `GET /api/clauses?state=&category=` | `/clauses` |
| FR-10 | Rule engine (JSON Logic + clause slugs) | `RuleEngine`, `ComplianceRule`, `Clause` | (drives panel after generate/save/analyze) |
| FR-11 | Version history | `Document.version`, `versionHistory` | Workspace panel |
| FR-12 | Approval HR → Manager → Final | `POST /api/documents/:id/workflow` `{ action, note?, actorUserId? }` | Workspace approval buttons |
| FR-13 | Audit trail | `GET /api/documents/:id/audit` | Workspace audit panel |
| FR-14 | Explain risk / auto-fix / suggest compliant | `POST .../explain-risk`, `/auto-fix`, `/suggest-compliant` | Workspace GenAI buttons |
| FR-15 | Export PDF / DOCX (client) | — | Workspace **Export PDF** / **Export DOCX** (`jspdf`, `docx`) |

## API reference (summary)

**Templates:** `POST /api/templates`, `GET /api/templates`, `GET /api/templates/:id`

**Clauses:** `GET /api/clauses`

**Documents:**

- `GET /api/documents` — query: `userId`, `limit`
- `POST /api/documents/generate` — body: `templateId`, `variables`, optional `userId`
- `PATCH /api/documents/:id` — body: `generatedContent` (manual save + rule re-eval)
- `POST /api/documents/ai-edit` — body: `documentId`, `prompt`
- `POST /api/documents/analyze` — body: `documentId`
- `GET /api/documents/:id`
- `DELETE /api/documents/:id` — query: optional `actorUserId`
- `GET /api/documents/:id/audit`
- `POST /api/documents/:id/workflow` — body: `action` (`submit` | `hr_approve` | `manager_approve` | `reject`), optional `note`, `actorUserId`
- `POST /api/documents/:id/explain-risk`
- `POST /api/documents/:id/auto-fix`
- `POST /api/documents/:id/suggest-compliant`

## Product notes

- **Auth** is not implemented; workflow actions are not cryptographically tied to HR vs manager roles.
- **Compliance seeds** are illustrative; validate thresholds and acts with current law and counsel.
- **Export PDF/DOCX** on the document workspace (`/documents/edit/[id]`) via client-side `jspdf` / `html2canvas` and `docx`.

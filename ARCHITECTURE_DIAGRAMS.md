# RAG System - Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Dashboard Page (app/dashboard/page.tsx)                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  [Generate with AI (RAG)] Button                        │    │
│  │  Opens Modal:                                           │    │
│  │  - Document Type: contract/sla/nda/policy/agreement   │    │
│  │  - User Input: textarea                               │    │
│  │  - [Generate] Button                                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                        │                                         │
│                        ▼                                         │
│  API Client (lib/api.ts)                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ generateDocumentWithRAG({                               │    │
│  │   userId, userInput, documentType                      │    │
│  │ })                                                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                        │                                         │
└────────────────────────┼─────────────────────────────────────────┘
                         │ HTTP POST
                         │ /api/documents/generate-rag
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express.js)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Routes (document.route.ts)                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ POST /documents/generate-rag                            │    │
│  └─────────────────────────────────────────────────────────┘    │
│                        │                                         │
│                        ▼                                         │
│  Controllers (document.controller.ts)                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ generateDocumentWithRAG()                               │    │
│  │ - Validate input                                        │    │
│  │ - Call DocumentService                                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                        │                                         │
│                        ▼                                         │
│  Services (document.service.ts)                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ generateDocumentWithRAG()                               │    │
│  │ - Call aiService.generateDocumentWithRAG()             │    │
│  │ - Run compliance checks (RuleEngine)                   │    │
│  │ - Save to database                                      │    │
│  │ - Log audit trail                                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                        │                                         │
│         ┌──────────────┴──────────────┐                         │
│         ▼                             ▼                         │
│  AI Service (AIService.ts)   RuleEngine (rule-engine.ts)      │
│  ┌─────────────────────────┐ ┌─────────────────────────────┐   │
│  │generateDocumentWithRAG()│ │ evaluate()                  │   │
│  │                         │ │ - Assess compliance         │   │
│  │ Calls OpenAIProvider    │ │ - Calculate risk score      │   │
│  └──────────┬──────────────┘ │ - Identify issues           │   │
│             │                │ - Generate suggestions      │   │
│             ▼                └─────────────────────────────┘   │
│  OpenAI Provider (OpenAIProvider.ts)                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ generateDocumentWithRAG()                               │   │
│  │                                                          │   │
│  │ 1. RETRIEVE (RAG)                                       │   │
│  │    └─> ClauseRepository.findFiltered()                │   │
│  │                                                          │   │
│  │ 2. AUGMENT                                             │   │
│  │    └─> buildRAGPrompt()                               │   │
│  │                                                          │   │
│  │ 3. GENERATE                                            │   │
│  │    └─> OpenAI API Call (gpt-4o-mini)                 │   │
│  │                                                          │   │
│  │ 4. PARSE                                               │   │
│  │    └─> JSON Response                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         └─────────────┬──────────────────────────────────┐     │
│                       ▼                                  ▼     │
│              Repositories              Audit Service             │
│        (clause.repository.ts)         (audit.service.ts)        │
│   ┌──────────────────────────┐  ┌───────────────────────────┐  │
│   │ Retrieve Clauses from DB │  │ Log Action & Timestamp    │  │
│   │ (MongoDB Clause Model)   │  │ Track User & Changes      │  │
│   └──────────────────────────┘  └───────────────────────────┘  │
│         │                                                       │
│         └────────────────────┬─────────────────────────────────┘
│                              ▼
│                    DocumentRepository
│                   (document.repository.ts)
│                   ┌─────────────────────────────┐
│                   │ Save Generated Document     │
│                   │ - Content                   │
│                   │ - Risk Score                │
│                   │ - Compliance Issues         │
│                   │ - Retrieved Clauses         │
│                   │ - Status: 'review'          │
│                   └──────────────┬──────────────┘
│                                  │
└──────────────────────────────────┼──────────────────────────────┘
                                   │
                    ┌──────────────┴─────────────┐
                    ▼                            ▼
           MongoDB (Database)         Response to Frontend
        ┌────────────────────────┐  ┌────────────────────────┐
        │ Document Collection    │  │ { success: true,       │
        │ Clause Collection      │  │   data: { ... }        │
        │ AuditLog Collection    │  │ }                      │
        └────────────────────────┘  └────────────────────────┘
                                               │
                                               ▼
                                    Frontend Dashboard
                                   Updates & Shows Document
```

---

## Data Flow: Request to Response

```
USER INTERACTION
┌─────────────────────────────────────────────────────────────┐
│ 1. Dashboard Open                                            │
│    - Click "Generate with AI (RAG)" Button                 │
│    - Modal appears with:                                    │
│      - Document Type selector                              │
│      - Requirements textarea                               │
│      - Generate button                                      │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
FRONTEND PROCESSING
┌─────────────────────────────────────────────────────────────┐
│ 2. Modal Form Submission                                    │
│    - User enters document type                             │
│    - User enters natural language requirements             │
│    - Click "Generate"                                      │
│    - handleGenerateWithRAG() called                        │
│    - Form data validated                                   │
│    - API request prepared                                  │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
API REQUEST
┌─────────────────────────────────────────────────────────────┐
│ 3. HTTP POST Request                                        │
│    POST /api/documents/generate-rag                        │
│    Headers: Content-Type: application/json                │
│    Body: {                                                 │
│      "userId": "507f...",                                 │
│      "userInput": "Create an SLA with...",                │
│      "documentType": "sla"                                │
│    }                                                       │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
BACKEND VALIDATION
┌─────────────────────────────────────────────────────────────┐
│ 4. Input Validation (Zod)                                  │
│    - userId: required, valid ObjectId                     │
│    - userInput: required, min 10 chars                    │
│    - documentType: required, not empty                    │
│    └─> If validation fails: return error                 │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
RETRIEVAL (RAG)
┌─────────────────────────────────────────────────────────────┐
│ 5. Retrieve Relevant Clauses                               │
│    - Extract keywords from userInput                      │
│    - Query ClauseRepository.findFiltered()               │
│    - Search clause titles, bodies, tags                  │
│    - Return top 5 relevant clauses                       │
│    Example results:                                       │
│    - "Service Level Metrics"                             │
│    - "Response Time SLA"                                 │
│    - "Uptime Guarantees"                                │
│    - "Service Credit Policy"                            │
│    - "Escalation Procedures"                            │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
AI GENERATION
┌─────────────────────────────────────────────────────────────┐
│ 6. Call OpenAI API with RAG Data                           │
│    - Build comprehensive prompt:                          │
│      - System prompt (legal expert role)                 │
│      - User requirements                                 │
│      - Retrieved clauses (full text)                    │
│    - Call OpenAI GPT-4o-mini                            │
│    - Returns: generated document content                 │
│    - Parse JSON response                                │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
COMPLIANCE CHECKING
┌─────────────────────────────────────────────────────────────┐
│ 7. Run RuleEngine Compliance Checks                        │
│    - Analyze generated content                            │
│    - Check for:                                           │
│      - Indian labor law compliance                       │
│      - PF/ESI applicability                              │
│      - Shops Act requirements                            │
│      - Missing critical clauses                          │
│    - Calculate risk score (0-100%)                       │
│    - Identify compliance issues                          │
│    - Generate suggestions                                │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
DATABASE STORAGE
┌─────────────────────────────────────────────────────────────┐
│ 8. Save Document to MongoDB                                │
│    - Create Document record with:                         │
│      - generatedContent: full document text              │
│      - variables: {                                       │
│        - userInput: original input                       │
│        - documentType: 'sla' etc                         │
│        - retrievedClauses: list of used clauses          │
│      }                                                    │
│      - riskScore: 12                                     │
│      - complianceIssues: [...]                           │
│      - suggestions: [...]                                │
│      - status: 'review'                                  │
│      - approvalStage: 'none'                             │
│    - Audit log entry created                            │
│    - Document ID generated                              │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
API RESPONSE
┌─────────────────────────────────────────────────────────────┐
│ 9. Return Success Response                                 │
│    HTTP 201 Created                                       │
│    {                                                      │
│      "success": true,                                    │
│      "data": {                                           │
│        "_id": "64a9f3d2...",                            │
│        "generatedContent": "SERVICE AGREEMENT\n\n...",  │
│        "retrievedClauses": [{...}, {...}],             │
│        "riskScore": 12,                                │
│        "complianceIssues": [],                         │
│        "suggestions": [...]                           │
│        "status": "review",                            │
│        "version": 1,                                  │
│        "approvalStage": "none",                       │
│        "createdAt": "2025-05-03T10:30:00Z"           │
│      }                                                │
│    }                                                   │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
FRONTEND UPDATE
┌─────────────────────────────────────────────────────────────┐
│ 10. Display Generated Document                             │
│     - Modal closes                                        │
│     - Form cleared                                        │
│     - Dashboard refreshes                                 │
│     - New document appears in Recent Documents table     │
│     - Show in grid:                                       │
│       - Document Type: "SLA"                             │
│       - Risk Score: 12%                                  │
│       - Status: review                                   │
│       - Actions: Open, Delete                            │
│     - User can click "Open" to review/edit               │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
USER REVIEW
┌─────────────────────────────────────────────────────────────┐
│ 11. User Reviews Document                                  │
│     - Open generated document in editor                   │
│     - Review AI-generated content                         │
│     - See compliance issues (if any)                      │
│     - See retrieved clauses used                          │
│     - Make manual edits if needed                         │
│     - Submit for approval workflow                        │
│     - Route to HR/Manager for sign-off                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Document States & Transitions

```
                    NEW DOCUMENT
                    (RAG Generated)
                           │
                           ▼
                    ┌──────────────────────┐
                    │  STATUS: review      │
                    │  STAGE: none         │
                    │  VERSION: 1          │
                    │  RISK: 0-100%        │
                    └──────────┬───────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ Manual Edit  │ │ Compliance   │ │ Submit for   │
        │              │ │ Check        │ │ Approval     │
        │ PATCH /      │ │              │ │              │
        │ documents/id │ │ POST /       │ │ POST /       │
        │              │ │ documents/id/│ │ documents/id/│
        │              │ │ analyze      │ │ workflow     │
        └──────┬───────┘ └──────────────┘ │ (action:     │
               │                          │  submit)     │
               │                          └──────┬───────┘
               │                                 │
               └─────────────────┬───────────────┘
                                 │
                                 ▼
                    ┌────────────────────────────┐
                    │ STATUS: review             │
                    │ STAGE: pending_hr          │
                    │ VERSION: 1                 │
                    │ Awaiting HR Approval       │
                    └────────────┬───────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
            ┌──────────────┐        ┌──────────────┐
            │ Reject       │        │ Approve HR   │
            │              │        │              │
            │ POST /       │        │ POST /       │
            │ documents/id/│        │ documents/id/│
            │ workflow     │        │ workflow     │
            │ (action:     │        │ (action:     │
            │  reject)     │        │  hr_approve) │
            └──────┬───────┘        └──────┬───────┘
                   │                       │
                   │                       ▼
                   │       ┌───────────────────────────┐
                   │       │ STATUS: review            │
                   │       │ STAGE: pending_manager    │
                   │       │ VERSION: 1                │
                   │       │ Awaiting Manager Approval │
                   │       └───────┬───────────────────┘
                   │               │
                   │   ┌───────────┴────────────┐
                   │   │                        │
                   │   ▼                        ▼
                   │ ┌──────────────┐   ┌──────────────┐
                   │ │ Reject       │   │ Approve      │
                   │ │              │   │ Manager      │
                   │ │ POST /...    │   │              │
                   │ │ workflow     │   │ POST /...    │
                   │ │ (reject)     │   │ workflow     │
                   │ └──────┬───────┘   │ (manager_    │
                   │        │           │  approve)    │
                   │        │           └──────┬───────┘
                   │        │                  │
                   │        │                  ▼
                   │        │    ┌────────────────────────┐
                   │        │    │ STATUS: final          │
                   │        │    │ STAGE: approved        │
                   │        │    │ VERSION: 1             │
                   │        │    │ ✓ APPROVED             │
                   │        │    └────────────────────────┘
                   │        │
                   └────────┴────────────────────┐
                                                 │
                                    ┌────────────▼──────────┐
                                    │ STATUS: draft         │
                                    │ STAGE: rejected       │
                                    │ VERSION: 1            │
                                    │ ✗ REJECTED (restart)  │
                                    └───────────────────────┘
```

---

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                           Frontend                              │
│                                                                  │
│  Dashboard (UI)                                                │
│  │                                                             │
│  ├─ State Management                                           │
│  │  ├─ documents[]                                            │
│  │  ├─ showRAGModal: boolean                                 │
│  │  ├─ ragInput: string                                      │
│  │  ├─ ragDocumentType: string                               │
│  │  └─ generating: boolean                                   │
│  │                                                             │
│  ├─ Event Handlers                                            │
│  │  ├─ handleGenerateWithRAG()                               │
│  │  └─ handleDelete()                                        │
│  │                                                             │
│  └─ API Client (lib/api.ts)                                  │
│     ├─ generateDocumentWithRAG()                             │
│     ├─ listDocuments()                                       │
│     └─ deleteDocument()                                      │
│                                                                │
└────────────────────────┬─────────────────────────────────────┘
                         │
                    HTTP API
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                         Backend                              │
│                                                              │
│  API Layer                                                 │
│  │                                                         │
│  └─ Routes (document.route.ts)                           │
│     ├─ POST /generate-rag                                │
│     ├─ GET /list                                         │
│     └─ DELETE /:id                                       │
│                                                           │
│  Controller Layer                                         │
│  │                                                        │
│  └─ Controllers (document.controller.ts)                │
│     ├─ generateDocumentWithRAG()                        │
│     ├─ listDocuments()                                  │
│     └─ deleteDocument()                                 │
│                                                          │
│  Service Layer                                          │
│  │                                                       │
│  ├─ DocumentService                                    │
│  │  └─ generateDocumentWithRAG()                       │
│  │                                                      │
│  ├─ AIService / OpenAIProvider                         │
│  │  ├─ generateDocumentWithRAG()                       │
│  │  └─ buildRAGPrompt()                               │
│  │                                                      │
│  ├─ RuleEngine                                         │
│  │  └─ evaluate()                                      │
│  │                                                      │
│  ├─ AuditService                                       │
│  │  └─ recordAudit()                                   │
│  │                                                      │
│  └─ ClauseRepository                                   │
│     └─ findFiltered()                                  │
│                                                         │
│  Repository Layer                                      │
│  │                                                      │
│  ├─ DocumentRepository                                │
│  │  ├─ create()                                       │
│  │  ├─ findById()                                     │
│  │  └─ findAll()                                      │
│  │                                                     │
│  ├─ ClauseRepository                                 │
│  │  └─ findFiltered()                                │
│  │                                                    │
│  └─ AuditLogRepository                              │
│     └─ create()                                      │
│                                                      │
└────────────────────────┬──────────────────────────────┘
                         │
                    MongoDB
                         │
┌────────────────────────▼──────────────────────────────┐
│                    Database                           │
│                                                       │
│  Collections:                                        │
│  ├─ documents                                        │
│  ├─ clauses                                          │
│  ├─ users                                            │
│  ├─ templates                                        │
│  ├─ auditlogs                                        │
│  └─ compliancerules                                 │
│                                                       │
└───────────────────────────────────────────────────────┘

External Services:
│
└─ OpenAI API
   ├─ gpt-4o-mini
   └─ Token counting
```

---

## RAG Process Detailed Flow

```
USER INPUT
│
│ "Create an SLA with 99.9% uptime, 4-hour critical response"
│
▼
┌──────────────────────────────────────────┐
│ STEP 1: RETRIEVE                         │
│ ──────────────────────────────────────────│
│ Input: userInput (string)                │
│ Action: Extract keywords & search        │
│                                          │
│ Keywords found:                          │
│ - sla                                    │
│ - uptime                                 │
│ - 99.9%                                  │
│ - response                               │
│ - critical                               │
│                                          │
│ Database search in clauses:              │
│ Query: title matches "uptime" OR "sla"   │
│        body contains keywords            │
│        tags include relevant categories  │
│                                          │
│ Retrieved Clauses:                       │
│ 1. "Service Level Metrics"               │
│    └─ body: "SLA metrics and definitions │
│ 2. "Uptime Guarantees"                   │
│    └─ body: "99.5% to 99.99% uptime..."  │
│ 3. "Response Time SLA"                   │
│    └─ body: "P1: 4h, P2: 8h, P3: 24h..." │
│ 4. "Service Credit Policy"               │
│    └─ body: "Credits for SLA breaches... │
│ 5. "Escalation Procedures"               │
│    └─ body: "Escalation paths and..."    │
└──────────────────────────────────────────┘
│
▼
┌──────────────────────────────────────────┐
│ STEP 2: AUGMENT                          │
│ ──────────────────────────────────────────│
│ Input: userInput + retrievedClauses      │
│ Action: Build comprehensive prompt       │
│                                          │
│ Build prompt structure:                  │
│ ┌────────────────────────────────────┐   │
│ │ System Prompt:                     │   │
│ │ "You are a legal expert specializ- │   │
│ │  ing in SLA generation..."         │   │
│ │                                    │   │
│ │ User Prompt:                       │   │
│ │ "Create a SLA based on:            │   │
│ │                                    │   │
│ │  User Requirements:                │   │
│ │  - 99.9% uptime guarantee          │   │
│ │  - 4-hour critical response        │   │
│ │                                    │   │
│ │  Relevant Clauses:                 │   │
│ │  Title: Service Level Metrics      │   │
│ │  Content: [full clause text]       │   │
│ │                                    │   │
│ │  Title: Response Time SLA          │   │
│ │  Content: [full clause text]       │   │
│ │  ...                               │   │
│ │                                    │   │
│ │  Generate complete SLA..."         │   │
│ └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
│
▼
┌──────────────────────────────────────────┐
│ STEP 3: GENERATE                         │
│ ──────────────────────────────────────────│
│ Input: Complete prompt                   │
│ Action: Call OpenAI API                  │
│                                          │
│ API Call:                                │
│ POST https://api.openai.com/v1/chat...  │
│ {                                        │
│   model: "gpt-4o-mini",                 │
│   messages: [                           │
│     {role: "system", content: "..."},   │
│     {role: "user", content: "..."}      │
│   ],                                     │
│   temperature: 0,                        │
│   max_tokens: 4096                       │
│ }                                        │
│                                          │
│ Response:                                │
│ {                                        │
│   "generatedContent": "SERVICE LEVEL    │
│     AGREEMENT\n\n1. SERVICE...",        │
│   "retrievedClauses": [...],             │
│   "metadata": {"engine": "gpt-4o-mini"}  │
│ }                                        │
│                                          │
│ Generated Content Preview:               │
│ ┌────────────────────────────────────┐   │
│ │ SERVICE LEVEL AGREEMENT            │   │
│ │                                    │   │
│ │ 1. SERVICE AVAILABILITY            │   │
│ │ Service Provider commits to        │   │
│ │ maintaining 99.9% uptime...        │   │
│ │                                    │   │
│ │ 2. RESPONSE TIMES                  │   │
│ │ - Critical (Severity 1): 4 hours   │   │
│ │ - High (Severity 2): 8 hours       │   │
│ │ - Medium (Severity 3): 24 hours    │   │
│ │                                    │   │
│ │ 3. SERVICE CREDITS                 │   │
│ │ If uptime falls below 99.9%...     │   │
│ │ ...                                │   │
│ └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
│
▼
┌──────────────────────────────────────────┐
│ STEP 4: VERIFY (Compliance Check)        │
│ ──────────────────────────────────────────│
│ Input: generatedContent                  │
│ Action: Run RuleEngine analysis          │
│                                          │
│ Compliance Checks:                       │
│ ✓ Uptime commitment valid                │
│ ✓ Response times specified               │
│ ✓ Service credits clause present         │
│ ✓ Escalation procedures included         │
│ ⚠ Consider adding maintenance windows    │
│ ⚠ Add force majeure clause               │
│                                          │
│ Results:                                 │
│ - riskScore: 12                          │
│ - complianceIssues: []                   │
│ - suggestions: [                         │
│     "Consider adding maintenance...",    │
│     "Add force majeure clause..."        │
│   ]                                      │
│                                          │
│ Final Status: "review"                   │
│ Safe for human review                    │
└──────────────────────────────────────────┘
│
▼
DOCUMENT READY FOR USER REVIEW
```

---

Perfect documentation! All RAG functionality is now fully documented with architecture, flows, and examples.

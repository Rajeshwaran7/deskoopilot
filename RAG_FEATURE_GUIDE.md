# RAG-Based Document Generation Feature

## Overview
This document describes the new **Retrieval-Augmented Generation (RAG)** functionality added to Deskoopilot. This feature allows users to generate compliant documents (contracts, service level agreements, NDAs, etc.) by providing natural language descriptions of their needs, without requiring predefined templates.

## Use Cases

### 1. **Service Level Agreements (SLAs)**
- **User Input**: "Create an SLA for software support services with 24-hour response time, 4-hour resolution for critical issues, and monthly review clauses."
- **Result**: The system retrieves relevant SLA clauses from the database and generates a complete, compliance-verified SLA document.

### 2. **Service Agreements / Contracts**
- **User Input**: "Generate a service agreement for our IT consulting services including scope of work, rates, payment terms, and IP ownership clauses."
- **Result**: A professional service contract incorporating relevant legal clauses.

### 3. **Non-Disclosure Agreements (NDAs)**
- **User Input**: "Create a mutual NDA for business discussions including confidential information definition, exclusions, and 3-year confidentiality period."
- **Result**: A comprehensive NDA document.

### 4. **Company Policies**
- **User Input**: "Draft a remote work policy covering eligibility, approval process, equipment provisions, and communication expectations."
- **Result**: A structured company policy document.

## Architecture

### Backend Components

#### 1. **AI Service Layer** (`backend/src/services/ai/`)

**AIService.ts** - Interface Definition
```typescript
export interface GenerateDocumentWithRAGResult {
  generatedContent: string;
  retrievedClauses: Array<{ title: string; body: string }>;
  metadata: { engine: string };
}

export interface AIService {
  generateDocumentWithRAG(userInput: string, documentType: string): Promise<GenerateDocumentWithRAGResult>;
  // ... other methods
}
```

**OpenAIProvider.ts** - Implementation
- `generateDocumentWithRAG(userInput, documentType)`: 
  - Retrieves relevant clauses from the database based on user input keywords
  - Passes clauses to OpenAI along with user requirements
  - Returns generated document with referenced clauses
  - Falls back to mock mode if API keys are not configured

#### 2. **Clause Repository** (`backend/src/repositories/clause.repository.ts`)
- Used for RAG to retrieve relevant clauses
- Filters by keywords, tags, and categories
- Returns up to 5 most relevant clauses

#### 3. **Document Model** (`backend/src/models/Document.model.ts`)
- Updated to make `templateId` optional (nullable)
- Documents can now be created from RAG without a template
- Stores retrieved clauses and user input in the variables field

#### 4. **Controllers & Routes**

**document.controller.ts** - New controller:
```typescript
export async function generateDocumentWithRAG(req: Request, res: Response, next: NextFunction)
```
- Validates input using `generateDocumentWithRAGSchema`
- Calls service layer
- Returns generated document

**document.route.ts** - New route:
```
POST /documents/generate-rag
```

#### 5. **Validators** (`backend/src/utils/validators.ts`)

```typescript
export const generateDocumentWithRAGSchema = z.object({
  userId: z.string().min(1),
  userInput: z.string().min(10),
  documentType: z.string().min(1)
});
```

### Frontend Components

#### 1. **API Client** (`frontend/lib/api.ts`)

```typescript
export interface GenerateDocumentWithRAGPayload {
  userId: string;
  userInput: string;
  documentType: string;
}

export function generateDocumentWithRAG(payload: GenerateDocumentWithRAGPayload)
```

#### 2. **Dashboard UI** (`frontend/app/dashboard/page.tsx`)
- Added "Generate with AI (RAG)" button
- Modal interface for user to:
  - Select document type
  - Enter requirements/description
  - Submit for generation

## API Reference

### Generate Document with RAG
**Endpoint**: `POST /api/documents/generate-rag`

**Request Body**:
```json
{
  "userId": "user-id-string",
  "userInput": "Create a service agreement for software development services...",
  "documentType": "contract"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "document-id",
    "userId": "user-id",
    "generatedContent": "Service Agreement\n\n1. Scope of Work...",
    "variables": {
      "userInput": "Create a service agreement...",
      "documentType": "contract",
      "retrievedClauses": [
        { "title": "Payment Terms", "body": "..." },
        { "title": "Confidentiality", "body": "..." }
      ]
    },
    "riskScore": 15,
    "suggestions": [],
    "complianceIssues": [],
    "status": "review",
    "version": 1,
    "approvalStage": "none"
  }
}
```

## Data Flow

```
┌─────────────────────────────┐
│   Frontend (Dashboard)      │
│  - Select Document Type     │
│  - Enter Requirements       │
└──────────────┬──────────────┘
               │ POST /generate-rag
               ▼
┌─────────────────────────────┐
│  Backend Controller         │
│  - Validate Input           │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  DocumentService            │
│  - Call aiService           │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  OpenAIProvider             │
│  1. Retrieve Clauses (RAG)  │
│  2. Build Prompt            │
│  3. Call OpenAI API         │
│  4. Parse Response          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  RuleEngine                 │
│  - Compliance Check         │
│  - Risk Scoring             │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  DocumentRepository         │
│  - Save Document            │
│  - Record Audit Trail       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│   Frontend Dashboard        │
│  - Display Generated Doc    │
│  - Show Clauses Used        │
└─────────────────────────────┘
```

## Supported Document Types

| Type | Description |
|------|-------------|
| `contract` | Service Agreement / Business Contract |
| `sla` | Service Level Agreement |
| `nda` | Non-Disclosure Agreement |
| `policy` | Company Policy Document |
| `agreement` | General Agreement |

## RAG Retrieval Strategy

The RAG system retrieves clauses by:

1. **Keyword Matching**: Splits user input into keywords
2. **Clause Filtering**: Searches clause titles, bodies, and tags
3. **Relevance Ranking**: Returns up to 5 most relevant clauses
4. **Clause Categories**: Currently supports: PF, ESI, Shops Act, General

### Example Retrieval
- User Input: "Create an SLA with response time requirements"
- Keywords: ["create", "sla", "response", "time", "requirements"]
- Retrieved Clauses: 
  - Service Level Commitments
  - Response Time SLA
  - Escalation Procedures
  - Monthly Review Process
  - Service Credits

## Compliance & Risk Scoring

All RAG-generated documents are evaluated by:

1. **Rule Engine**: Applies India-specific compliance rules
2. **AI Analysis**: OpenAI compliance checks
3. **Combined Risk Score**: Maximum of both scores
4. **Issue Flagging**: Identifies compliance gaps

Generated documents are stored with status `review` and must be approved before finalization.

## Usage Flow in UI

1. Click **"Generate with AI (RAG)"** button on Dashboard
2. Modal appears with:
   - Document Type dropdown
   - Requirements textarea
3. User enters natural language description
4. Click **"Generate"**
5. System:
   - Retrieves relevant clauses
   - Generates document with OpenAI
   - Runs compliance checks
   - Redirects to edit view
6. User can:
   - Review generated document
   - Check compliance issues
   - Make manual edits
   - Submit for approval

## Error Handling

### Validation Errors
- `userInput` must be at least 10 characters
- `documentType` must be specified
- `userId` must be valid

### API Errors
- Missing API keys → Falls back to mock generation
- OpenAI timeout → Returns partial response with clauses
- Database errors → Returns 500 error

## Configuration

### Environment Variables
```
OPENAI_API_KEY=sk-...         # or Azure OpenAI key
AZURE_OPENAI_KEY=...
AZURE_OPENAI_ENDPOINT=...
AZURE_OPENAI_DEPLOYMENT_NAME=...
```

### Mock Mode
If API keys are missing/invalid, the system generates mock documents for demonstration purposes.

## Database Seeding

Ensure your Clause collection is populated with relevant clauses:

```bash
# From backend directory
npm run seed
```

This loads default clauses for PF, ESI, Shops Act, and general categories.

## Testing the Feature

### Manual Test Steps

1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   npm run seed
   npm run dev
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Test Request**:
   ```bash
   curl -X POST http://localhost:4000/api/documents/generate-rag \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "507f1f77bcf86cd799439011",
       "userInput": "Create a service level agreement for IT support with 99.9% uptime, 4-hour response time for critical issues",
       "documentType": "sla"
     }'
   ```

4. **UI Test**:
   - Navigate to Dashboard
   - Click "Generate with AI (RAG)"
   - Select document type
   - Enter requirements
   - Click Generate
   - Verify document appears in Recent Documents table

## Future Enhancements

1. **Vector Embeddings**: Replace keyword matching with semantic similarity using embeddings
2. **Advanced Filtering**: Support filtering by company, state, jurisdiction
3. **Clause Templates**: Allow users to create reusable clause collections
4. **Multi-Language**: Support document generation in regional Indian languages
5. **Custom Prompt Engineering**: Allow organizations to define custom generation rules
6. **Batch Generation**: Generate multiple documents from CSV/spreadsheet
7. **Document Templates**: Save generated documents as templates for reuse

## Troubleshooting

### Document not appearing after generation
- Check browser console for errors
- Verify API response status
- Check backend logs for validation errors

### Generated content looks incomplete
- Ensure clauses are populated in database
- Verify OpenAI API quota
- Check token limits in OpenAI response

### Compliance issues showing for valid documents
- Review rule engine rules in `rule-engine.service.ts`
- Verify India-specific compliance requirements
- Adjust risk scoring thresholds

## Support

For issues or questions:
1. Check backend logs: `backend/debug-logs/`
2. Review audit trail: `GET /api/documents/{id}/audit`
3. Test with mock mode first (if API keys missing)
4. Verify clause database: `GET /api/clauses`

## License

This feature is part of Deskoopilot. See main LICENSE file.

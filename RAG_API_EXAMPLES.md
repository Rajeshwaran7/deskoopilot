# RAG Generation - API Test Examples

## Endpoint
```
POST /api/documents/generate-rag
```

## Base URL
```
http://localhost:4000/api
```

---

## Example 1: Service Level Agreement (SLA)

### Request
```bash
curl -X POST http://localhost:4000/api/documents/generate-rag \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "userInput": "Create a comprehensive service level agreement for our IT support division. Include 99.9% uptime guarantee, 4-hour response time for critical issues, 8-hour for high priority, 24-hour for medium, and 48-hour for low priority incidents. Add monthly reporting requirements and service credit clauses for non-compliance. Include escalation procedures and quarterly business reviews.",
    "documentType": "sla"
  }'
```

### Response
```json
{
  "success": true,
  "data": {
    "_id": "64a9f3d2c5e8b9f2a1c3e5g7",
    "userId": "507f1f77bcf86cd799439011",
    "templateId": null,
    "generatedContent": "SERVICE LEVEL AGREEMENT\n\n1. SERVICES COVERED\nThis SLA applies to all IT support services provided...\n\n2. SERVICE AVAILABILITY\nServiceProvider commits to maintaining 99.9% uptime...\n\n3. RESPONSE TIMES\n- Critical (Severity 1): 4 hours\n- High (Severity 2): 8 hours\n- Medium (Severity 3): 24 hours\n- Low (Severity 4): 48 hours\n\n4. SERVICE CREDITS\nIf uptime falls below 99.9% in any calendar month:\n- 99.5% - 99.9%: 5% monthly service credit\n- 99.0% - 99.5%: 10% monthly service credit\n- Below 99.0%: 25% monthly service credit\n...",
    "variables": {
      "userInput": "Create a comprehensive service level agreement...",
      "documentType": "sla",
      "retrievedClauses": [
        {
          "title": "Service Level Commitments",
          "body": "Service Provider shall maintain agreed upon service levels..."
        },
        {
          "title": "Response Time SLA",
          "body": "Response time begins when ticket is opened..."
        },
        {
          "title": "Escalation Procedures",
          "body": "For unresolved issues exceeding time threshold..."
        }
      ]
    },
    "riskScore": 12,
    "suggestions": [
      "Consider adding specific maintenance windows",
      "Add clause for emergency maintenance exceptions"
    ],
    "complianceIssues": [],
    "status": "review",
    "version": 1,
    "versionHistory": [],
    "approvalStage": "none",
    "approvalEvents": [],
    "createdAt": "2025-05-03T10:30:00Z",
    "updatedAt": "2025-05-03T10:30:00Z"
  }
}
```

---

## Example 2: Service Agreement / Contract

### Request
```bash
curl -X POST http://localhost:4000/api/documents/generate-rag \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "userInput": "Generate a service agreement for custom software development services. Key points: Project scope includes requirement gathering, design, development, testing, and deployment. Fixed price contract at INR 25 lakhs. Payment terms: 30% advance, 40% on delivery of MVP, 30% on full deployment. Include intellectual property ownership (IP transfers to client), confidentiality of both parties, warranty period of 6 months with free bug fixes, and dispute resolution through arbitration in Delhi.",
    "documentType": "contract"
  }'
```

### Response
```json
{
  "success": true,
  "data": {
    "_id": "64a9f3d2c5e8b9f2a1c3e5h8",
    "userId": "507f1f77bcf86cd799439011",
    "templateId": null,
    "generatedContent": "SERVICE AGREEMENT\n\nThis Service Agreement (\"Agreement\") is entered into as of [Date] between...\n\nSCOPE OF WORK:\n- Requirement Gathering and Analysis\n- System Design and Architecture\n- Custom Development\n- Quality Assurance and Testing\n- Deployment and Launch Support\n\nPRICE AND PAYMENT:\nTotal Price: INR 25,00,000 (Indian Rupees Twenty-five Lakhs)\n\nPayment Schedule:\n1. Upon Signature: 30% (INR 7,50,000)\n2. Upon MVP Delivery: 40% (INR 10,00,000)\n3. Upon Full Deployment: 30% (INR 7,50,000)\n\nINTELLECTUAL PROPERTY:\nAll intellectual property, including source code, designs, and documentation, shall be transferred to Client upon final payment.\n\nCONFIDENTIALITY:\nBoth parties agree to maintain confidentiality of proprietary information...\n\nWARRANTY:\nService Provider warrants error-free functionality for 6 months from deployment. Free bug fixes and support provided during warranty period.\n\nDISPUTE RESOLUTION:\nAny disputes shall be resolved through arbitration in Delhi under Indian Arbitration Act...",
    "variables": {
      "userInput": "Generate a service agreement for custom software development...",
      "documentType": "contract",
      "retrievedClauses": [
        {
          "title": "Scope of Work",
          "body": "Service Provider shall provide services as described..."
        },
        {
          "title": "Payment Terms and Conditions",
          "body": "Payment schedule and terms shall be as follows..."
        },
        {
          "title": "Intellectual Property Rights",
          "body": "All IP created during service delivery transfers to Client..."
        },
        {
          "title": "Confidentiality and NDA",
          "body": "Both parties commit to maintaining confidentiality..."
        }
      ]
    },
    "riskScore": 8,
    "suggestions": [],
    "complianceIssues": [],
    "status": "review",
    "version": 1,
    "versionHistory": [],
    "approvalStage": "none",
    "approvalEvents": [],
    "createdAt": "2025-05-03T10:35:00Z",
    "updatedAt": "2025-05-03T10:35:00Z"
  }
}
```

---

## Example 3: Non-Disclosure Agreement (NDA)

### Request
```bash
curl -X POST http://localhost:4000/api/documents/generate-rag \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "userInput": "Create a mutual NDA for business discussions and partnership evaluation. 3-year confidentiality period. Exclude from confidential: information already public, independently developed, or received from third parties. Include permitted disclosures: to advisors, lawyers, and employees with legitimate business need. Return of information obligations upon request or within 30 days of termination.",
    "documentType": "nda"
  }'
```

### Response
```json
{
  "success": true,
  "data": {
    "_id": "64a9f3d2c5e8b9f2a1c3e5i9",
    "userId": "507f1f77bcf86cd799439011",
    "templateId": null,
    "generatedContent": "MUTUAL NON-DISCLOSURE AGREEMENT\n\n1. DEFINITION OF CONFIDENTIAL INFORMATION\nConfidential Information includes any technical, business, or financial information disclosed...\n\n2. CONFIDENTIALITY OBLIGATIONS\nEach party agrees to maintain the confidentiality of the other party's information for a period of THREE (3) YEARS from the date of disclosure.\n\n3. EXCLUSIONS\nThe following shall not be considered Confidential Information:\n(a) Information that is or becomes publicly available through no breach of this Agreement\n(b) Information independently developed without access to the other party's information\n(c) Information rightfully received from third parties without confidentiality restrictions\n(d) Information developed without use of or reference to the other party's information\n\n4. PERMITTED DISCLOSURES\nEither party may disclose Confidential Information to:\n- Legal advisors and accountants under confidentiality obligations\n- Employees and contractors with legitimate business need\n- Government agencies as required by law (with notice to disclosing party)\n\n5. RETURN OF INFORMATION\nUpon request or within THIRTY (30) DAYS of termination of discussions, each party shall return or destroy all Confidential Information in its possession.\n\n6. TERM\nThis Agreement shall be effective for THREE (3) YEARS from the date hereof and shall automatically terminate thereafter.",
    "variables": {
      "userInput": "Create a mutual NDA for business discussions...",
      "documentType": "nda",
      "retrievedClauses": [
        {
          "title": "Confidential Information Definition",
          "body": "Confidential Information means proprietary information..."
        },
        {
          "title": "Mutual Obligations",
          "body": "Both parties agree to maintain confidentiality..."
        },
        {
          "title": "Permitted Disclosures",
          "body": "Disclosures may be made to professional advisors..."
        }
      ]
    },
    "riskScore": 5,
    "suggestions": [],
    "complianceIssues": [],
    "status": "review",
    "version": 1,
    "versionHistory": [],
    "approvalStage": "none",
    "approvalEvents": [],
    "createdAt": "2025-05-03T10:40:00Z",
    "updatedAt": "2025-05-03T10:40:00Z"
  }
}
```

---

## Example 4: Company Policy

### Request
```bash
curl -X POST http://localhost:4000/api/documents/generate-rag \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "userInput": "Create a comprehensive remote work policy. Eligibility: employees must be with company for minimum 6 months and manager approval required. Work-from-home days: maximum 3 days per week. Equipment: company provides laptop and peripherals, employee responsible for internet connectivity. Communication: must be available on company communication channels 9 AM - 6 PM, attendance tracking via check-in system. Leave policy unchanged. Performance evaluation same as office.",
    "documentType": "policy"
  }'
```

### Response
```json
{
  "success": true,
  "data": {
    "_id": "64a9f3d2c5e8b9f2a1c3e5j0",
    "userId": "507f1f77bcf86cd799439011",
    "templateId": null,
    "generatedContent": "REMOTE WORK POLICY\n\n1. PURPOSE\nTo establish guidelines for remote work arrangements within the organization.\n\n2. ELIGIBILITY\n2.1 Employees must have completed a minimum of SIX (6) MONTHS of continuous service.\n2.2 Prior manager approval is mandatory for all remote work arrangements.\n2.3 Eligibility is at the discretion of the company.\n\n3. WORK-FROM-HOME ARRANGEMENT\n3.1 Maximum THREE (3) days per week may be worked remotely.\n3.2 Remote work days must be approved in advance.\n3.3 On-site attendance required for team meetings and collaboration.\n\n4. EQUIPMENT AND TECHNOLOGY\n4.1 Company shall provide:\n   - Desktop/Laptop computer\n   - Peripherals as required for job function\n4.2 Employee is responsible for:\n   - Internet connectivity at remote location\n   - Secure network environment\n   - Backup internet arrangement\n\n5. COMMUNICATION AND AVAILABILITY\n5.1 Employees must maintain availability on company communication platforms during business hours (9:00 AM - 6:00 PM IST).\n5.2 Attendance shall be tracked via check-in system.\n5.3 Prompt response to work communications is expected.\n\n6. LEAVE POLICY\n6.1 Existing leave policies remain unchanged for remote workers.\n\n7. PERFORMANCE EVALUATION\n7.1 Performance metrics and evaluation criteria remain the same for both office and remote workers.",
    "variables": {
      "userInput": "Create a comprehensive remote work policy...",
      "documentType": "policy",
      "retrievedClauses": [
        {
          "title": "Work from Home Eligibility",
          "body": "Employees with 6+ months tenure may apply..."
        },
        {
          "title": "Equipment and Allowances",
          "body": "Company provides equipment; employee ensures connectivity..."
        },
        {
          "title": "Performance Management",
          "body": "Remote employees evaluated on same metrics..."
        }
      ]
    },
    "riskScore": 3,
    "suggestions": [],
    "complianceIssues": [],
    "status": "review",
    "version": 1,
    "versionHistory": [],
    "approvalStage": "none",
    "approvalEvents": [],
    "createdAt": "2025-05-03T10:45:00Z",
    "updatedAt": "2025-05-03T10:45:00Z"
  }
}
```

---

## Example 5: General Agreement

### Request
```bash
curl -X POST http://localhost:4000/api/documents/generate-rag \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "userInput": "Create a partnership agreement between two companies for joint marketing initiatives. Equal ownership (50-50), decision-making by consensus, profit sharing 50-50. Term of 2 years, renewable annually. Either party can exit with 90-day notice. Intellectual property created jointly is shared equally.",
    "documentType": "agreement"
  }'
```

---

## Testing in Postman

### 1. Set up environment variable
```
userId: 507f1f77bcf86cd799439011
```

### 2. Create POST request
```
URL: {{baseUrl}}/documents/generate-rag
Method: POST
Content-Type: application/json
```

### 3. Body (raw JSON)
```json
{
  "userId": "{{userId}}",
  "userInput": "Your requirements here...",
  "documentType": "contract"
}
```

---

## Error Responses

### Validation Error (Missing userInput)
```json
{
  "success": false,
  "error": "userInput: String must contain at least 10 character(s)"
}
```

### Validation Error (Invalid userId)
```json
{
  "success": false,
  "error": "userId: Invalid userId format"
}
```

### API Error (500)
```json
{
  "error": "Internal server error",
  "message": "Failed to generate document with RAG"
}
```

---

## Testing with JavaScript/Fetch

```javascript
async function generateDocumentRAG() {
  const response = await fetch('http://localhost:4000/api/documents/generate-rag', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: '507f1f77bcf86cd799439011',
      userInput: 'Create a service agreement for software development with confidentiality clauses',
      documentType: 'contract'
    })
  });

  const data = await response.json();
  console.log('Generated Document:', data.data);
  return data.data;
}

generateDocumentRAG();
```

---

## Tips for Best Results

1. **Clear Requirements**: More detailed input produces better documents
2. **Specific Terms**: Include numerical values (percentages, timelines, amounts)
3. **Business Context**: Mention industry/vertical for relevant clauses
4. **Legal References**: For India-specific requirements, mention them explicitly
5. **Approval Workflow**: Generated docs start in "review" status for safety

---

## Monitoring Generation

### Check Generated Document
```bash
curl -X GET http://localhost:4000/api/documents/{document_id}
```

### View Audit Trail
```bash
curl -X GET http://localhost:4000/api/documents/{document_id}/audit
```

### Analyze Compliance
```bash
curl -X POST http://localhost:4000/api/documents/{document_id}/analyze
```

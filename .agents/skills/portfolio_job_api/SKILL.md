---
name: portfolio-job-api
description: >
  Save, update, query, and manage photography and creative jobs in the Portfolio Database
  for Wagner (Fotografia), Daiana, and Aflora Espaço Criativo. Use this skill whenever
  asked to register a new job, update an existing project, list/search jobs, or link portfolio media.
---

# Portfolio Database — REST API Agent Skill

This skill allows an AI agent to interact directly with the **Portfolio Database REST API** to store, update, query, and manage creative projects for **Wagner (Fotografia)**, **Daiana**, and **Aflora Espaço Criativo**.

---

## 1. Environment & Authentication

### Base URL
```
http://localhost:3000
```
*(In production environments, replace with the deployed domain URI)*

### Request Headers
Every request **must** contain the Authorization header with the Bearer API Key:

```http
Authorization: Bearer pfdb_wgn_afl_2026_Xk9mN3pQrT7vLsY2
Content-Type: application/json
```

---

2. **Agent Decision & Execution Workflow**

When receiving a request from a user to save or update a job, follow these steps:

1. **Extract Job Parameters**:
   - **Title**: Project name or concise summary.
   - **Client**: Client name or brand.
   - **Performer**: Infer who executed the work:
     - Mentioning Wagner / photography → `"wagner"`
     - Mentioning Daiana → `"daiana"`
     - Mentioning Aflora / Espaço Criativo / branding / studio → `"aflora"`
     - Joint project / teamwork → `"joint"`
     - If unspecified → default to `"wagner"`.
   - **Date**: Parse any date into standard ISO `YYYY-MM-DD` (e.g., "15/08/2026" or "ontem"). If unspecified, use current date.
   - **Value**: Convert currency strings to a raw float (e.g., `"R$ 2.500,00"` → `2500`).
   - **Status**:
     - Completed / delivered / finished → `"completed"` (default)
     - Upcoming / scheduled → `"planned"`
     - Work in progress → `"in_progress"`
     - Draft / proposal → `"draft"`
   - **Categories**: Array of category names (e.g., `["Casamento", "B2C"]`). Missing categories are automatically created by the API.
   - **Tags**: Array of tag names without `#` (e.g., `["fotografia", "externo"]`). Missing tags are automatically created by the API.
   - **Reportage Links**: Array of news/media report links (e.g., `[{"url": "https://g1.globo.com/...", "title": "Notícia G1", "published_date": "2026-05-10"}]`).

2. **🔒 REQUIRED: Present Structured Summary & Request User Confirmation**:
   - **BEFORE** making any `POST /api/jobs` or `PATCH /api/jobs/:id` call, present the extracted parameters to the user in a clean, formatted Markdown table or card list.
   - Ask for the user's explicit confirmation to proceed (e.g., *"Por favor, confirme se as informações acima estão corretas para realizar o cadastro."*).
   - Only execute the API request once the user approves.

3. **Execute API Request**:
   - Upon confirmation, send the HTTP request to the target endpoint.

4. **Respond to User**:
   - Confirm successful registration/update with a friendly Portuguese summary including job title, date, client, assigned performer, and links.

---

## 3. Endpoints Reference

### A. List All Jobs (`GET /api/jobs`)
Retrieves all portfolio jobs ordered by date descending.

**Request:**
```http
GET /api/jobs
Authorization: Bearer pfdb_wgn_afl_2026_Xk9mN3pQrT7vLsY2
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Cobertura Casamento Ana & Pedro",
      "client_name": "Ana Clara Souza",
      "performer": "wagner",
      "job_date": "2026-07-20",
      "location": "Florianópolis, SC",
      "value": 3500,
      "status": "completed",
      "drive_url": "https://drive.google.com/drive/folders/sample",
      "youtube_url": null,
      "categories": [{ "id": "cat-1", "name": "Casamento", "color": "#6366f1" }],
      "tags": [{ "id": "tag-1", "name": "fotografia", "color": "#8b5cf6" }]
    }
  ]
}
```

---

### B. Register New Job (`POST /api/jobs`)
Creates a new project record. Category and tag names are resolved automatically.

**Request:**
```http
POST /api/jobs
Authorization: Bearer pfdb_wgn_afl_2026_Xk9mN3pQrT7vLsY2
Content-Type: application/json

{
  "title": "Ensaio Gestante — Juliana",
  "client_name": "Juliana Mendes",
  "performer": "wagner",
  "job_date": "2026-07-28",
  "location": "Praia Mole, Florianópolis",
  "value": 1200,
  "status": "completed",
  "description": "Ensaio ao por do sol com figurino próprio.",
  "drive_url": "https://drive.google.com/drive/folders/123xyz",
  "youtube_url": "",
  "categories": ["Retrato", "B2C"],
  "tags": ["fotografia", "gestante", "externo"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "title": "Ensaio Gestante — Juliana",
    "status": "completed"
  }
}
```

---

### C. Get Job Details (`GET /api/jobs/:id`)
Fetch full job object by UUID.

**Request:**
```http
GET /api/jobs/f47ac10b-58cc-4372-a567-0e02b2c3d479
Authorization: Bearer pfdb_wgn_afl_2026_Xk9mN3pQrT7vLsY2
```

---

### D. Update Job (`PATCH /api/jobs/:id`)
Partially update an existing job. Only include the fields to be modified.

**Request:**
```http
PATCH /api/jobs/f47ac10b-58cc-4372-a567-0e02b2c3d479
Authorization: Bearer pfdb_wgn_afl_2026_Xk9mN3pQrT7vLsY2
Content-Type: application/json

{
  "drive_url": "https://drive.google.com/drive/folders/updated_link",
  "status": "completed"
}
```

> 🔒 **Security Notice**: `DELETE /api/jobs/:id` is disabled via the API. Deletions must be performed through the Web UI to prevent accidental data loss.

---

## 4. Parameter Reference Table

| Parameter | Type | Required | Description | Examples / Accepted Values |
| :--- | :--- | :--- | :--- | :--- |
| `title` | `string` | **Yes (POST)** | Project title | `"Cobertura Evento Tech"` |
| `job_date` | `string` | **Yes (POST)** | Event date in YYYY-MM-DD | `"2026-07-28"` |
| `client_name` | `string` | No | Client or company name | `"Acme Corp"` |
| `performer` | `enum` | No | Execution party | `"wagner"`, `"daiana"`, `"aflora"`, `"joint"` |
| `value` | `number` | No | Commercial amount in BRL | `2500` |
| `status` | `enum` | No | Project status | `"draft"`, `"planned"`, `"in_progress"`, `"completed"`, `"cancelled"` |
| `location` | `string` | No | Location / City / Venue | `"Florianópolis, SC"` |
| `description` | `string` | No | Notes, scope, or briefing | `"Entrega via Drive em 5 dias"` |
| `drive_url` | `string` | No | Google Drive link | `"https://drive.google.com/..."` |
| `youtube_url` | `string` | No | YouTube video link | `"https://youtube.com/watch?v=..."` |
| `categories` | `string[]`| No | Commercial category names | `["B2B", "Evento"]` |
| `tags` | `string[]`| No | Tag names (no `#`) | `["video", "teaser"]` |
| `reportage_links` | `array` | No | Press/media report links | `[{"url": "https://g1.globo.com/...", "title": "Notícia G1", "published_date": "2026-05-10"}]` |
| `custom_fields`| `object` | No | Extra dynamic field values | `{"edital_numero": "04/2026"}` |

---

## 5. Execution Code Snippets

### cURL
```bash
curl -X POST "http://localhost:3000/api/jobs" \
  -H "Authorization: Bearer pfdb_wgn_afl_2026_Xk9mN3pQrT7vLsY2" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fotografia de Arquitetura",
    "client_name": "Studio Arq",
    "performer": "wagner",
    "job_date": "2026-07-28",
    "value": 2800,
    "categories": ["B2B", "Arquitetura"],
    "tags": ["interiores", "design"]
  }'
```

### Python
```python
import requests

url = "http://localhost:3000/api/jobs"
headers = {
    "Authorization": "Bearer pfdb_wgn_afl_2026_Xk9mN3pQrT7vLsY2",
    "Content-Type": "application/json"
}
payload = {
    "title": "Fotografia de Arquitetura",
    "client_name": "Studio Arq",
    "performer": "wagner",
    "job_date": "2026-07-28",
    "value": 2800,
    "categories": ["B2B", "Arquitetura"],
    "tags": ["interiores", "design"]
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())
```

---

## 6. Error Handling Table

| Status Code | Meaning | Cause / Recommended Agent Fix |
| :--- | :--- | :--- |
| `400 Bad Request` | Missing or invalid field | Check error message. Ensure `title` and `job_date` are present and valid. |
| `401 Unauthorized` | Invalid bearer token | Verify the `Authorization: Bearer ...` header key. |
| `404 Not Found` | Invalid Job UUID | Verify the job UUID exists using `GET /api/jobs`. |
| `500 Server Error` | Database/server failure | Check connection to Supabase or environment configuration. |

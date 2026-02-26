# ShopAI – Product Discovery with AI Assist

A full-stack product discovery app with a **FastAPI** backend and **React + Vite** frontend. Users can browse a product catalog and use a natural-language "Ask AI" box powered by **Groq** (Llama 3.3 70B) to find the perfect product.

---

## Tech Stack

| Layer    | Technology                                  |
|----------|---------------------------------------------|
| Backend  | Python 3.11+, FastAPI, Uvicorn              |
| Frontend | React 18, Vite 5                            |
| AI / LLM | Groq (`llama-3.3-70b-versatile` by default) |
| Data     | In-memory mock catalog (8 products)         |

---

## Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- A **Groq API key** ([get one free at console.groq.com](https://console.groq.com/keys))

---

## Setup & Run

### 1. Clone & navigate

```bash
git clone <your-repo-url>
cd assessment
```

### 2. Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create your .env file from the example
cp .env.example .env
# Then open .env and set: GROQ_API_KEY=gsk_...your-key...

# Start the API server (runs on http://localhost:8000)
uvicorn main:app --reload
```

> **Environment Variables**
> | Variable     | Required | Default                    | Description                         |
> |--------------|----------|----------------------------|-------------------------------------|
> | `GROQ_API_KEY` | ✅ Yes | —                          | Your Groq secret key                |
> | `GROQ_MODEL`   | No     | `llama-3.3-70b-versatile`  | Any Groq chat model to override     |

### 3. Frontend

```bash
# Open a new terminal tab
cd frontend

# Install dependencies
npm install

# Start the dev server (runs on http://localhost:5173)
npm run dev
```

Then open **http://localhost:5173** in your browser.

> Vite proxies `/api` requests to `http://localhost:8000` so there's no CORS issue in dev.

---

## API Endpoints

### `GET /api/products`

Returns the full product catalog. Supports optional filtering:

| Query Param | Type   | Description                                    |
|-------------|--------|------------------------------------------------|
| `category`  | string | Filter by category (`laptops`, `tablets`, etc.)|
| `q`         | string | Keyword search across name, description, tags  |

**Example:**
```
GET /api/products?category=laptops
GET /api/products?q=wireless
```

**Response:**
```json
{
  "products": [...],
  "total": 3
}
```

---

### `POST /api/ask`

AI-powered natural-language product search.

**Request body:**
```json
{ "query": "Show me budget laptops" }
```

**Response:**
```json
{
  "products": [...],
  "productIds": ["2"],
  "summary": "For budget-conscious users, the BudgetBook 15 at $349.99 is your best bet..."
}
```

**Error responses:**
- `400` – empty or too-long query
- `502` – LLM call failed (network / rate-limit)
- `503` – `GROQ_API_KEY` not configured

---

## What's Implemented

### Backend
- **`products.py`** – 8 in-memory products across 4 categories (laptops, tablets, audio, accessories)
- **`llm.py`** – Groq helper: builds a structured prompt with the full product catalog, calls the Groq Chat Completions API, parses JSON output (`productIds + summary`), handles API errors gracefully
- **`main.py`** – FastAPI app with CORS, `GET /api/products`, `POST /api/ask`

### Frontend
- **`ProductCard`** – Reusable card component showing name, price, rating, tags, category emoji, "AI Match" badge
- **`SearchBar`** – Controlled input with quick-prompt chips, loading state, submit button
- **`AiSummary`** – Displays the LLM-generated recommendation
- **`LoadingSpinner`** – Accessible loading indicator
- **`ProductModal`** – Detail sheet with stats grid, all tags, stock level; opens on card click
- **`App.jsx`** – State & data flow: `useState`, `useEffect`, `useCallback`; catalog fetch on mount, category filter, AI search, error/loading states

### AI Flow
1. User types a natural-language query and clicks "Ask AI"
2. Frontend `POST /api/ask` → FastAPI → Groq Llama 3.3 70B
3. Prompt includes the full product catalog (id, name, category, price, tags, description snippet)
4. LLM returns `{"productIds": [...], "summary": "..."}` as structured JSON
5. Backend validates, fetches matching products, returns to frontend
6. Frontend shows AI summary banner + highlighted "AI Match" product cards

---

## Project Structure

```
assessment/
├── backend/
│   ├── main.py            # FastAPI app & routes
│   ├── products.py        # Mock product catalog
│   ├── llm.py             # Groq LLM integration
│   ├── requirements.txt
│   └── .env.example       # Copy to .env and add your key
└── frontend/
    ├── index.html
    ├── vite.config.js      # Proxies /api → localhost:8000
    ├── package.json
    └── src/
        ├── App.jsx
        ├── index.css
        └── components/
            ├── ProductCard.jsx
            ├── SearchBar.jsx
            ├── AiSummary.jsx
            ├── LoadingSpinner.jsx
            └── ProductModal.jsx
```

---

## Time Spent

~2.5 hours total:
- ~1 hour backend + LLM prompt design
- ~1 hour frontend UI + state management
- ~30 min integration testing and README

---

## Notes & Trade-offs

- **No database** – product data lives in memory as required by the spec
- **No auth** – out of scope per spec
- **`llama-3.3-70b-versatile`** – chosen for high quality and fast Groq inference; swap via `GROQ_MODEL` env var
- **`response_format: json_object`** – enforced on the Groq call to avoid markdown-wrapped JSON

## What I'd Add With More Time

- Redis caching for repeated identical queries
- Product detail page at `/products/:id`
- Streaming the AI response for faster perceived performance
- Pagination for larger catalogs
- Unit tests for the prompt builder and response parser

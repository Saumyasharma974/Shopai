"""
FastAPI backend for the Product Discovery app.
Endpoints:
  GET  /api/products   - list or filter products
  POST /api/ask        - natural-language search powered by Groq LLM
"""

import logging
import os
from contextlib import asynccontextmanager
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from llm import ask_llm
from products import filter_products, get_all_products, get_products_by_ids

# Load .env early so os.getenv works in helper modules too
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ─── App setup ───────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Product Discovery API starting up …")
    yield
    logger.info("Product Discovery API shutting down …")


app = FastAPI(
    title="Product Discovery API",
    description="Backend for the AI-powered product discovery experience.",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow all origins so any deployed frontend (Vercel, Netlify, etc.) can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Pydantic schemas ─────────────────────────────────────────────────────────

class AskRequest(BaseModel):
    query: str


class AskResponse(BaseModel):
    products: list[dict]
    productIds: list[str]
    summary: str


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/api/products", summary="List or filter products")
def list_products(
    category: Optional[str] = Query(None, description="Filter by product category"),
    q: Optional[str] = Query(None, description="Keyword search across name, description, tags"),
):
    """
    Returns the product catalog, optionally filtered by `category` and/or
    keyword `q`.
    """
    products = filter_products(category=category, query=q)
    return {"products": products, "total": len(products)}


@app.post("/api/ask", response_model=AskResponse, summary="AI-powered natural-language search")
def ask(body: AskRequest):
    """
    Accepts a natural-language query, sends it to the LLM with the full
    product catalog as context, and returns matching products + a short
    AI-generated summary.
    """
    query = body.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    if len(query) > 500:
        raise HTTPException(status_code=400, detail="Query is too long (max 500 characters).")

    all_products = get_all_products()

    try:
        llm_result = ask_llm(query, all_products)
    except ValueError as exc:
        # Missing API key or bad config
        raise HTTPException(status_code=503, detail=str(exc))
    except RuntimeError as exc:
        # LLM network/parsing error
        raise HTTPException(status_code=502, detail=str(exc))

    matched_products = get_products_by_ids(llm_result["productIds"])

    return AskResponse(
        products=matched_products,
        productIds=llm_result["productIds"],
        summary=llm_result["summary"],
    )


@app.get("/health", include_in_schema=False)
def health():
    return {"status": "ok"}

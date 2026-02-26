"""
LLM integration helper using Groq API.
Builds a prompt with product context and parses structured JSON output.
"""

import os
import json
import logging
from groq import Groq, APIStatusError, APITimeoutError, APIConnectionError

logger = logging.getLogger(__name__)


def get_groq_client() -> Groq:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set.")
    return Groq(api_key=api_key)


def build_product_context(products: list[dict]) -> str:
    """Serialize products into a compact string for the prompt."""
    lines = []
    for p in products:
        lines.append(
            f'ID:{p["id"]} | {p["name"]} | Category:{p["category"]} | '
            f'Price:${p["price"]} | Tags:{",".join(p["tags"])} | '
            f'Desc:{p["description"][:80]}'
        )
    return "\n".join(lines)


def ask_llm(user_query: str, products: list[dict]) -> dict:
    """
    Send a natural-language query + product catalog to the LLM via Groq.

    Returns:
        {
            "productIds": ["1", "3", ...],
            "summary": "Short AI-generated recommendation text."
        }
    Raises:
        RuntimeError on LLM API failure.
    """
    client = get_groq_client()
    product_context = build_product_context(products)

    system_prompt = (
        "You are a helpful product discovery assistant. "
        "Given a user query and a product catalog, identify the most relevant products and "
        "provide a brief, friendly recommendation summary.\n\n"
        "Always respond in valid JSON with exactly this shape:\n"
        '{"productIds": ["<id>", ...], "summary": "<short recommendation text>"}\n\n'
        "Rules:\n"
        "- productIds must be a list of matching product ID strings from the catalog (can be empty if no match).\n"
        "- summary must be 1-2 sentences max, concise and friendly.\n"
        "- Do NOT include markdown, code fences, or extra keys.\n"
        "- Only output raw JSON."
    )

    user_prompt = (
        f"User query: \"{user_query}\"\n\n"
        f"Product catalog:\n{product_context}\n\n"
        "Return the JSON response."
    )

    try:
        response = client.chat.completions.create(
            model=os.getenv("GROQ_MODEL_ID", "llama-3.3-70b-versatile"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
            max_tokens=300,
            response_format={"type": "json_object"},
        )

        raw = response.choices[0].message.content.strip()
        logger.debug("LLM raw response: %s", raw)

        parsed = json.loads(raw)

        # Validate and normalise output shape
        product_ids = parsed.get("productIds", [])
        summary = parsed.get("summary", "")

        if not isinstance(product_ids, list):
            product_ids = []
        product_ids = [str(pid) for pid in product_ids]

        return {"productIds": product_ids, "summary": str(summary)}

    except (APIStatusError, APITimeoutError, APIConnectionError) as exc:
        logger.error("Groq API error: %s", exc)
        raise RuntimeError(f"LLM service unavailable: {exc.message if hasattr(exc, 'message') else str(exc)}")
    except json.JSONDecodeError as exc:
        logger.error("Failed to parse LLM JSON response: %s", exc)
        raise RuntimeError("LLM returned an unparsable response. Please try again.")
    except Exception as exc:
        logger.error("Unexpected LLM error: %s", exc)
        raise RuntimeError("An unexpected error occurred while contacting the AI service.")

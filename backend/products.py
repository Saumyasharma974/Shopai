"""
Mock product catalog - in-memory data store.
"""

PRODUCTS = [
    {
        "id": "1",
        "name": "UltraBook Pro 14",
        "category": "laptops",
        "price": 899.99,
        "description": "Slim and lightweight laptop with Intel Core i7, 16GB RAM, and 512GB SSD. Perfect for professionals on the go.",
        "tags": ["ultrabook", "portable", "work", "productivity"],
        "rating": 4.5,
        "stock": 23,
    },
    {
        "id": "2",
        "name": "BudgetBook 15",
        "category": "laptops",
        "price": 349.99,
        "description": "Affordable everyday laptop with AMD Ryzen 5, 8GB RAM, and 256GB SSD. Great value for students and basic tasks.",
        "tags": ["budget", "student", "everyday", "affordable"],
        "rating": 4.0,
        "stock": 47,
    },
    {
        "id": "3",
        "name": "GameForce X17",
        "category": "laptops",
        "price": 1499.99,
        "description": "High-performance gaming laptop with RTX 4070, Intel Core i9, 32GB RAM, and 1TB NVMe SSD. Dominate every game.",
        "tags": ["gaming", "high-performance", "RTX", "fast"],
        "rating": 4.8,
        "stock": 10,
    },
    {
        "id": "4",
        "name": "PixelPad 12 Pro",
        "category": "tablets",
        "price": 649.99,
        "description": "Premium Android tablet with a 12-inch AMOLED display, 256GB storage, and an included stylus. Great for artists and note-takers.",
        "tags": ["tablet", "stylus", "art", "android", "amoled"],
        "rating": 4.6,
        "stock": 30,
    },
    {
        "id": "5",
        "name": "SlateAir 10",
        "category": "tablets",
        "price": 249.99,
        "description": "Compact and light budget tablet with a 10-inch display, ideal for reading, streaming, and light browsing.",
        "tags": ["tablet", "budget", "reading", "streaming", "compact"],
        "rating": 3.9,
        "stock": 60,
    },
    {
        "id": "6",
        "name": "SoundWave Pro ANC",
        "category": "audio",
        "price": 199.99,
        "description": "Premium wireless headphones with active noise cancellation, 30-hour battery life, and rich Hi-Fi sound.",
        "tags": ["headphones", "wireless", "noise-cancelling", "anc", "audio"],
        "rating": 4.7,
        "stock": 85,
    },
    {
        "id": "7",
        "name": "BudgetBuds Lite",
        "category": "audio",
        "price": 29.99,
        "description": "Affordable true wireless earbuds with 6-hour battery, decent bass, and a secure fit for daily use.",
        "tags": ["earbuds", "tws", "budget", "wireless", "everyday"],
        "rating": 3.8,
        "stock": 200,
    },
    {
        "id": "8",
        "name": "MechStrike RGB",
        "category": "accessories",
        "price": 119.99,
        "description": "Tactile mechanical keyboard with Cherry MX switches, per-key RGB lighting, and a compact TKL layout. Perfect for gamers and typists.",
        "tags": ["keyboard", "mechanical", "rgb", "gaming", "typing"],
        "rating": 4.4,
        "stock": 40,
    },
]


def get_all_products():
    return PRODUCTS


def get_products_by_ids(ids: list[str]):
    return [p for p in PRODUCTS if p["id"] in ids]


def filter_products(category: str = None, query: str = None):
    result = PRODUCTS
    if category:
        result = [p for p in result if p["category"].lower() == category.lower()]
    if query:
        query_lower = query.lower()
        result = [
            p for p in result
            if query_lower in p["name"].lower()
            or query_lower in p["description"].lower()
            or any(query_lower in tag for tag in p["tags"])
            or query_lower in p["category"].lower()
        ]
    return result

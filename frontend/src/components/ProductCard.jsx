/**
 * ProductCard – Reusable card component to display a single product.
 * Props:
 *   product     {object}  – product data from the API
 *   highlighted {boolean} – true when this card appears in AI search results
 *   onClick     {func}    – handler to open the detail modal
 */

const CATEGORY_EMOJI = {
    laptops: '💻',
    tablets: '📱',
    audio: '🎧',
    accessories: '⌨️',
}

export default function ProductCard({ product, highlighted = false, onClick }) {
    const emoji = CATEGORY_EMOJI[product.category] ?? '🛍️'

    return (
        <div
            className={`product-card${highlighted ? ' highlighted' : ''}`}
            onClick={() => onClick && onClick(product)}
            role="button"
            tabIndex={0}
            aria-label={`View details for ${product.name}`}
            onKeyDown={(e) => e.key === 'Enter' && onClick && onClick(product)}
        >
            {highlighted && <span className="ai-match-badge">✨ AI Match</span>}

            <span className="card-emoji">{emoji}</span>

            <span className="card-category-badge">{product.category}</span>

            <h3 className="card-name">{product.name}</h3>
            <p className="card-description">{product.description}</p>

            <div className="card-footer">
                <div className="card-price">
                    <span>$</span>{product.price.toFixed(2)}
                </div>
                <div className="card-rating">
                    ★ {product.rating.toFixed(1)}
                </div>
            </div>

            <div className="card-tags">
                {product.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="tag">#{tag}</span>
                ))}
            </div>
        </div>
    )
}

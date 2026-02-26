/**
 * ProductModal – Detail sheet for a single product.
 * Props:
 *   product   {object|null} – product to display, or null to hide
 *   onClose   {func}        – close handler
 */

const CATEGORY_EMOJI = {
    laptops: '💻',
    tablets: '📱',
    audio: '🎧',
    accessories: '⌨️',
}

export default function ProductModal({ product, onClose }) {
    if (!product) return null

    const emoji = CATEGORY_EMOJI[product.category] ?? '🛍️'

    // Close on overlay click
    function handleOverlayClick(e) {
        if (e.target === e.currentTarget) onClose()
    }

    // Close on Escape key
    function handleKeyDown(e) {
        if (e.key === 'Escape') onClose()
    }

    return (
        <div
            className="modal-overlay"
            onClick={handleOverlayClick}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-product-name"
            tabIndex={-1}
        >
            <div className="modal">
                <button
                    className="modal-close"
                    onClick={onClose}
                    aria-label="Close product detail"
                >
                    ✕
                </button>

                <span className="modal-emoji" aria-hidden="true">{emoji}</span>
                <span className="card-category-badge modal-category-badge">{product.category}</span>

                <h2 className="modal-name" id="modal-product-name">{product.name}</h2>
                <p className="modal-description">{product.description}</p>

                <div className="modal-stats">
                    <div className="stat-box">
                        <div className="stat-label">Price</div>
                        <div className="stat-value">${product.price.toFixed(2)}</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Rating</div>
                        <div className="stat-value" style={{ color: 'var(--warning)' }}>
                            ★ {product.rating.toFixed(1)}
                        </div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">In Stock</div>
                        <div
                            className="stat-value"
                            style={{ color: product.stock > 20 ? 'var(--success)' : 'var(--warning)', fontSize: '18px' }}
                        >
                            {product.stock} units
                        </div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-label">Category</div>
                        <div className="stat-value" style={{ fontSize: '16px', textTransform: 'capitalize' }}>
                            {product.category}
                        </div>
                    </div>
                </div>

                <div className="modal-tags">
                    <div className="modal-tags-label">Tags</div>
                    <div className="card-tags">
                        {product.tags.map((tag) => (
                            <span key={tag} className="tag">#{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

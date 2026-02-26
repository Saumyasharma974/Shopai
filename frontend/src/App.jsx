import { useState, useEffect, useCallback } from 'react'
import SearchBar from './components/SearchBar'
import ProductCard from './components/ProductCard'
import AiSummary from './components/AiSummary'
import LoadingSpinner from './components/LoadingSpinner'
import ProductModal from './components/ProductModal'

const CATEGORIES = ['all', 'laptops', 'tablets', 'audio', 'accessories']

export default function App() {
    // ── State ──────────────────────────────────────────────────
    const [allProducts, setAllProducts] = useState([])      // full catalog from API
    const [displayProducts, setDisplayProducts] = useState([])    // what's shown in the grid
    const [aiSummary, setAiSummary] = useState('')       // LLM summary text
    const [aiProductIds, setAiProductIds] = useState(null)     // null = no AI search yet

    const [query, setQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState('all')

    const [loadingCatalog, setLoadingCatalog] = useState(true)
    const [loadingAsk, setLoadingAsk] = useState(false)

    const [catalogError, setCatalogError] = useState(null)
    const [askError, setAskError] = useState(null)

    const [selectedProduct, setSelectedProduct] = useState(null) // modal


    // ── Load full product catalog on mount ────────────────────
    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch('/api/products')
                if (!res.ok) throw new Error(`Server error: ${res.status}`)
                const data = await res.json()
                setAllProducts(data.products)
                setDisplayProducts(data.products)
            } catch (err) {
                setCatalogError(err.message || 'Failed to load products.')
            } finally {
                setLoadingCatalog(false)
            }
        }
        fetchProducts()
    }, [])


    // ── Re-filter catalog when category changes (no AI mode) ──
    useEffect(() => {
        if (aiProductIds !== null) return  // AI search is active; don't override

        if (activeCategory === 'all') {
            setDisplayProducts(allProducts)
        } else {
            setDisplayProducts(allProducts.filter(p => p.category === activeCategory))
        }
    }, [activeCategory, allProducts, aiProductIds])


    // ── Category filter handler ───────────────────────────────
    function handleCategoryChange(cat) {
        setActiveCategory(cat)
        setAiProductIds(null)  // exit AI search mode
        setAiSummary('')
        setAskError(null)
        setQuery('')
    }


    // ── AI ask handler ────────────────────────────────────────
    const handleAsk = useCallback(async () => {
        if (!query.trim() || loadingAsk) return
        setLoadingAsk(true)
        setAskError(null)
        setAiSummary('')
        setAiProductIds(null)

        try {
            const res = await fetch('/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query.trim() }),
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.detail || `Error ${res.status}: AI service unavailable.`)
            }

            setAiProductIds(data.productIds)
            setAiSummary(data.summary)

            // Show AI-matched products (or all if none matched)
            if (data.products && data.products.length > 0) {
                setDisplayProducts(data.products)
            } else {
                setDisplayProducts([])
            }
            setActiveCategory('all')

        } catch (err) {
            setAskError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setLoadingAsk(false)
        }
    }, [query, loadingAsk])


    // ── Determine section title ───────────────────────────────
    const sectionTitle = aiProductIds !== null
        ? `AI Results for "${query}"`
        : activeCategory === 'all' ? 'All Products' : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}`


    // ── Render ────────────────────────────────────────────────
    return (
        <div className="app-wrapper">

            {/* ── Header ── */}
            <header className="site-header">
                <div className="logo" aria-hidden="true">
                    <div className="logo-icon">🛍️</div>
                    <span className="logo-text">Shop<span>AI</span></span>
                </div>
                <p className="site-tagline">
                    Discover products with natural-language AI search. Just describe what you need.
                </p>
            </header>

            {/* ── Search Bar ── */}
            <SearchBar
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onSubmit={handleAsk}
                isLoading={loadingAsk}
            />

            {/* ── Ask Error ── */}
            {askError && (
                <div className="error-banner" role="alert">
                    <span aria-hidden="true">⚠️</span>
                    <span>{askError}</span>
                </div>
            )}

            {/* ── AI Summary ── */}
            {aiSummary && <AiSummary summary={aiSummary} />}

            {/* ── Divider ── */}
            <div className="divider" />

            {/* ── Category Filters (hidden in AI mode) ── */}
            {aiProductIds === null && (
                <div className="filter-bar" role="group" aria-label="Filter by category">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            className={`filter-btn${activeCategory === cat ? ' active' : ''}`}
                            onClick={() => handleCategoryChange(cat)}
                            aria-pressed={activeCategory === cat}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Section Header ── */}
            <div className="section-header">
                <h2 className="section-title">{sectionTitle}</h2>
                {!loadingCatalog && !loadingAsk && (
                    <span className="section-count">{displayProducts.length} products</span>
                )}
            </div>

            {/* ── Product Grid ── */}
            {loadingCatalog ? (
                <LoadingSpinner label="Loading catalog…" />
            ) : catalogError ? (
                <div className="error-banner" role="alert">
                    <span aria-hidden="true">❌</span>
                    <span>{catalogError}</span>
                </div>
            ) : loadingAsk ? (
                <LoadingSpinner label="AI is finding the best products for you…" />
            ) : displayProducts.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <h3>No products found</h3>
                    <p>Try a different query or browse all products.</p>
                </div>
            ) : (
                <main>
                    <div className="products-grid">
                        {displayProducts.map((product, i) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                highlighted={aiProductIds !== null && aiProductIds.includes(product.id)}
                                onClick={setSelectedProduct}
                                style={{ animationDelay: `${i * 0.05}s` }}
                            />
                        ))}
                    </div>

                    {/* Show "back to browse" button after AI search */}
                    {aiProductIds !== null && (
                        <div style={{ textAlign: 'center', marginTop: '32px' }}>
                            <button
                                className="filter-btn"
                                onClick={() => handleCategoryChange('all')}
                            >
                                ← Browse all products
                            </button>
                        </div>
                    )}
                </main>
            )}

            {/* ── Product Detail Modal ── */}
            <ProductModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />

        </div>
    )
}

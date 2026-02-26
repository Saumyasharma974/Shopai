/**
 * SearchBar – Natural-language ask box with quick-prompt chips.
 * Props:
 *   value       {string}  – controlled input value
 *   onChange    {func}    – input change handler
 *   onSubmit    {func}    – form submit handler
 *   isLoading   {boolean} – disable button while loading
 */

const QUICK_PROMPTS = [
    'Budget laptops under $400',
    'Best gaming setup',
    'Wireless audio gear',
    'Work from home accessories',
    'Tablets for art',
]

export default function SearchBar({ value, onChange, onSubmit, isLoading }) {
    function handleSubmit(e) {
        e.preventDefault()
        if (!isLoading && value.trim()) onSubmit()
    }

    function handleChipClick(prompt) {
        onChange({ target: { value: prompt } })
    }

    return (
        <section className="search-section" aria-label="AI product search">
            <label className="search-label" htmlFor="ask-input">
                Ask AI · Search products
            </label>

            <form className="search-form" onSubmit={handleSubmit}>
                <input
                    id="ask-input"
                    className="search-input"
                    type="text"
                    placeholder="e.g. Show me budget laptops or What is good for gaming?"
                    value={value}
                    onChange={onChange}
                    disabled={isLoading}
                    autoComplete="off"
                    maxLength={500}
                    aria-label="Natural language product search"
                />
                <button
                    type="submit"
                    className="search-btn"
                    disabled={isLoading || !value.trim()}
                    aria-label="Search with AI"
                >
                    {isLoading ? (
                        <>
                            <span className="btn-spinner" aria-hidden="true">⏳</span>
                            Thinking…
                        </>
                    ) : (
                        <>
                            <span aria-hidden="true">✨</span>
                            Ask AI
                        </>
                    )}
                </button>
            </form>

            <div className="quick-prompts" role="group" aria-label="Quick prompt suggestions">
                {QUICK_PROMPTS.map((p) => (
                    <button
                        key={p}
                        className="quick-chip"
                        type="button"
                        onClick={() => handleChipClick(p)}
                        disabled={isLoading}
                    >
                        {p}
                    </button>
                ))}
            </div>
        </section>
    )
}

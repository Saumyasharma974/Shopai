/**
 * AiSummary – Displays the AI-generated recommendation text.
 * Props:
 *   summary {string} – short text returned from POST /api/ask
 */
export default function AiSummary({ summary }) {
    if (!summary) return null

    return (
        <div className="ai-summary" role="region" aria-label="AI recommendation summary">
            <span className="ai-summary-icon" aria-hidden="true">🤖</span>
            <div className="ai-summary-content">
                <div className="ai-summary-label">AI Recommendation</div>
                <p className="ai-summary-text">{summary}</p>
            </div>
        </div>
    )
}

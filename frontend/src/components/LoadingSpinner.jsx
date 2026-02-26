/**
 * LoadingSpinner – Generic loading indicator.
 * Props:
 *   label {string} – optional message to show under spinner
 */
export default function LoadingSpinner({ label = 'Loading…' }) {
    return (
        <div className="spinner-wrapper" role="status" aria-live="polite">
            <div className="spinner" aria-hidden="true" />
            <span className="spinner-label">{label}</span>
        </div>
    )
}

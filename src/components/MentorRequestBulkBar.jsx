export default function MentorRequestBulkBar({
  selectedCount,
  allSelected,
  loading = false,
  onToggleAll,
  onCancel,
  onAction,
}) {
  if (!selectedCount) return null;

  return (
    <div className="bulk-actions-bar fixed">
      <div className="bulk-selection-summary">
        <span>{selectedCount} selected</span>
        <label>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(event) => onToggleAll(event.target.checked)}
            onMouseDown={(event) => event.preventDefault()}
          />
          All
        </label>
      </div>
      <div className="bulk-action-buttons">
        <button
          className="bulk-cancel"
          type="button"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          className="bulk-connect"
          type="button"
          onClick={() => onAction("connect")}
          disabled={loading}
        >
          Verify
        </button>
        <button
          className="bulk-reject"
          type="button"
          onClick={() => onAction("reject")}
          disabled={loading}
        >
          Reject
        </button>
      </div>
    </div>
  );
}

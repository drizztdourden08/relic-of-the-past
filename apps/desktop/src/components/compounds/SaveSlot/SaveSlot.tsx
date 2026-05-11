import './SaveSlot.css';

interface SaveSlotProps {
  slot: number;
  screenshotUrl: string | null;
  timestamp: number;
  isEmpty: boolean;
  busy: boolean;
  shortcutKey?: string;
  disableSave?: boolean;
  disableLoad?: boolean;
  onSave: (slot: number) => void;
  onLoad: (slot: number) => void;
}

export function SaveSlot({
  slot,
  screenshotUrl,
  timestamp,
  isEmpty,
  busy,
  shortcutKey,
  disableSave,
  disableLoad,
  onSave,
  onLoad,
}: SaveSlotProps) {
  return (
    <div className={`save-slot ${busy ? 'save-slot--busy' : ''}`}>
      <div className="save-slot__card">
        {screenshotUrl ? (
          <img src={screenshotUrl} alt={`Slot ${slot + 1}`} className="save-slot__img" />
        ) : (
          <div className="save-slot__empty" />
        )}
        <span className="save-slot__num">{slot + 1}</span>
        {shortcutKey && <span className="save-slot__key">{shortcutKey}</span>}
        <div className="save-slot__btns">
          <button
            className="save-slot__btn save-slot__btn--save"
            onClick={() => onSave(slot)}
            disabled={busy || disableSave}
            title={shortcutKey ? `Save (Shift+${shortcutKey})` : 'Save state'}
            aria-label={`Save slot ${slot + 1}`}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4.414A1 1 0 0 0 14.707 4L12 1.293A1 1 0 0 0 11.293 1H2zm0 1h1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V2.414L14 5.414V14H2V2zm3 0v3h4V2H5z" />
            </svg>
          </button>
          <button
            className="save-slot__btn save-slot__btn--load"
            onClick={() => onLoad(slot)}
            disabled={isEmpty || busy || disableLoad}
            title={shortcutKey ? `Load (${shortcutKey})` : 'Load state'}
            aria-label={`Load slot ${slot + 1}`}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
              <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
            </svg>
          </button>
        </div>
      </div>
      {!isEmpty && (
        <span className="save-slot__time">
          {new Date(timestamp).toLocaleString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </span>
      )}
    </div>
  );
}

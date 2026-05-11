interface WindowControlsProps {
  isMaximized: boolean;
}

export function WindowControls({ isMaximized }: WindowControlsProps): JSX.Element {
  return (
    <div className="titlebar__right">
      <button
        className="titlebar__control"
        onClick={() => window.api.minimize()}
        aria-label="Minimize"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <rect x="1" y="5.5" width="10" height="1" />
        </svg>
      </button>
      <button
        className="titlebar__control"
        onClick={() => window.api.maximize()}
        aria-label={isMaximized ? 'Restore' : 'Maximize'}
      >
        {isMaximized ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M3 1h8v8h-2v2H1V3h2V1zm1 1v1h5v5h1V2H4zm-2 2v6h6V4H2z" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect x="1" y="1" width="10" height="10" rx="0" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        )}
      </button>
      <button
        className="titlebar__control titlebar__control--close"
        onClick={() => window.api.close()}
        aria-label="Close"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M1.5 0.5L6 5L10.5 0.5L11.5 1.5L7 6L11.5 10.5L10.5 11.5L6 7L1.5 11.5L0.5 10.5L5 6L0.5 1.5Z" />
        </svg>
      </button>
    </div>
  );
}

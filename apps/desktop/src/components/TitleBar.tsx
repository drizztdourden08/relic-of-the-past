import { useState, useEffect, useRef } from 'react';

interface TitleBarProps {
  onLoadRom: () => void;
}

export function TitleBar({ onLoadRom }: TitleBarProps): JSX.Element {
  const [isMaximized, setIsMaximized] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.api.isMaximized().then(setIsMaximized);
    const cleanup = window.api.onMaximizedChange(setIsMaximized);
    return cleanup;
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <div className="titlebar">
      {/* Left: menu */}
      <div className="titlebar-left" ref={menuRef}>
        <button
          className="titlebar-btn titlebar-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
          </svg>
        </button>

        {menuOpen && (
          <div className="dropdown-menu">
            <button
              className="dropdown-item"
              onClick={() => {
                setMenuOpen(false);
                onLoadRom();
              }}
            >
              <span className="dropdown-icon">📁</span>
              Load ROM...
            </button>
            <div className="dropdown-separator" />
            <button className="dropdown-item" disabled>
              <span className="dropdown-icon">⚙️</span>
              Settings
            </button>
            <button className="dropdown-item" disabled>
              <span className="dropdown-icon">ℹ️</span>
              About
            </button>
            <div className="dropdown-separator" />
            <button
              className="dropdown-item"
              onClick={() => window.api.close()}
            >
              <span className="dropdown-icon">✕</span>
              Quit
            </button>
          </div>
        )}
      </div>

      {/* Center: draggable title area */}
      <div className="titlebar-center">
        <span className="titlebar-title">ALttP Randomizer</span>
      </div>

      {/* Right: window controls */}
      <div className="titlebar-right">
        <button
          className="titlebar-btn titlebar-control"
          onClick={() => window.api.minimize()}
          aria-label="Minimize"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect x="1" y="5.5" width="10" height="1" />
          </svg>
        </button>
        <button
          className="titlebar-btn titlebar-control"
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
          className="titlebar-btn titlebar-control titlebar-close"
          onClick={() => window.api.close()}
          aria-label="Close"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M1.5 0.5L6 5L10.5 0.5L11.5 1.5L7 6L11.5 10.5L10.5 11.5L6 7L1.5 11.5L0.5 10.5L5 6L0.5 1.5Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

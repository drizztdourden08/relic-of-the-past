import { useRef, useState, useEffect, useCallback } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { DropdownMenu } from '../../composites/DropdownMenu';
import { IconButton } from '../../primitives/IconButton';
import { useTitleBar } from './behavior/useTitleBar';
import { WindowControls } from './sub-components/WindowControls';
import { getFps } from '../../../lib/game';
import './TitleBar.css';

interface TitleBarProps {
  onImportRom: () => void;
  onSwitchProfile: () => void;
  onShowProfile: () => void;
  onShowLogs: () => void;
  onToggleSaveStates: () => void;
  onToggleInventory: () => void;
  onToggleChecks: () => void;
  onShowDataManager: (tab?: string) => void;
  onShowInputTester: () => void;
  onShowCredits: () => void;
  onShowSpriteDebug: () => void;
  activeProfile: Profile | null;
  gameRunning: boolean;
  windowMode?: GameSettings['windowMode'];
  isMuted?: boolean;
  onToggleMute?: () => void;
  showFps?: boolean;
}

export function TitleBar({
  onImportRom,
  onSwitchProfile,
  onShowProfile,
  onShowLogs,
  onToggleSaveStates,
  onToggleInventory,
  onToggleChecks,
  onShowDataManager,
  onShowInputTester,
  onShowCredits,
  onShowSpriteDebug,
  activeProfile,
  gameRunning,
  windowMode = 'default',
  isMuted = false,
  onToggleMute,
  showFps = false,
}: TitleBarProps): JSX.Element {
  const menuRef = useRef<HTMLDivElement>(null);
  const debugMenuRef = useRef<HTMLDivElement>(null);
  const { isMaximized, menuOpen, toggleMenu, closeMenu } = useTitleBar(menuRef);
  const [debugMenuOpen, setDebugMenuOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fps, setFps] = useState(0);
  const titlebarRef = useRef<HTMLDivElement>(null);

  // Track fullscreen state independently of windowMode
  useEffect(() => {
    window.api.isFullscreen().then(setIsFullscreen);
    return window.api.onFullscreenChange(setIsFullscreen);
  }, []);

  const hidden = windowMode === 'borderless' || isFullscreen;

  // For borderless/fullscreen: show titlebar when mouse enters the top zone, hide when it leaves
  useEffect(() => {
    if (!hidden) return;

    const ZONE_HEIGHT = 38; // matches --titlebar-height
    const onMove = (e: MouseEvent) => {
      // If the mouse is over the titlebar element itself, keep it shown
      if (titlebarRef.current?.contains(e.target as Node)) return;
      setHovered(e.clientY <= ZONE_HEIGHT);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [hidden]);

  // Hide when mouse leaves the titlebar element (not just the zone)
  const handleMouseLeave = () => {
    if (hidden) setHovered(false);
  };

  useEffect(() => {
    if (!showFps || !gameRunning) {
      setFps(0);
      return;
    }
    const id = setInterval(() => {
      setFps(getFps());
    }, 500);
    return () => clearInterval(id);
  }, [showFps, gameRunning]);

  const togglePin = async () => {
    const result = await window.api.setAlwaysOnTop(!pinned);
    setPinned(result);
  };

  const toggleMute = () => {
    onToggleMute?.();
  };

  // Close debug menu on outside click
  useEffect(() => {
    if (!debugMenuOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (debugMenuRef.current?.contains(target)) return;
      if ((target as Element).closest?.('.dropdown-menu')) return;
      setDebugMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [debugMenuOpen]);

  const menuItems: (Parameters<typeof DropdownMenu>[0]['items'][number])[] = [
    {
      key: 'home',
      icon: '🏠',
      label: 'Home',
      disabled: !activeProfile,
      onClick: () => { closeMenu(); onShowProfile(); },
    },
    {
      key: 'save-states',
      icon: '💾',
      label: 'Save States',
      disabled: !gameRunning,
      onClick: () => { closeMenu(); onToggleSaveStates(); },
    },
    'separator',
    {
      key: 'data',
      icon: '📦',
      label: 'Data',
      children: [
        { key: 'profiles', icon: '👤', label: 'Profiles', onClick: () => { closeMenu(); onShowDataManager('profiles'); } },
        { key: 'roms', icon: '🎮', label: 'ROMs', onClick: () => { closeMenu(); onShowDataManager('roms'); } },
        { key: 'languages', icon: '🌐', label: 'Languages', onClick: () => { closeMenu(); onShowDataManager('languages'); } },
        { key: 'msu', icon: '🎵', label: 'MSU', onClick: () => { closeMenu(); onShowDataManager('msu'); } },
        { key: 'sprites', icon: '🖼️', label: 'Sprites', onClick: () => { closeMenu(); onShowDataManager('sprites'); } },
      ],
    },
    {
      key: 'tools',
      icon: '🔧',
      label: 'Tools',
      children: [
        { key: 'inventory', icon: '🎒', label: 'Inventory Tracker', onClick: () => { closeMenu(); onToggleInventory(); } },
        { key: 'checks', icon: '🗺️', label: 'Checks Tracker', onClick: () => { closeMenu(); onToggleChecks(); } },
        { key: 'logs', icon: '📋', label: 'Logs', onClick: () => { closeMenu(); onShowLogs(); } },
        { key: 'input-tester', icon: '🎮', label: 'Input Calibration', onClick: () => { closeMenu(); onShowInputTester(); } },
      ],
    },
    'separator',
    {
      key: 'credits',
      icon: '📜',
      label: 'Credits',
      onClick: () => { closeMenu(); onShowCredits(); },
    },
    { key: 'quit', icon: '✕', label: 'Quit', onClick: () => window.api.close() },
  ];

  // Dev-only debug menu (separate dropdown)
  const debugMenuItems: typeof menuItems = window.api.isDev ? [
    {
      key: 'sprite-debug',
      icon: '🖼️',
      label: 'Sprite Debug',
      description: 'Review all item sprites',
      onClick: () => { setDebugMenuOpen(false); onShowSpriteDebug(); },
    },
    {
      key: 'dev-console',
      icon: '🛠️',
      label: 'Dev Console',
      description: 'Open Chrome DevTools',
      onClick: () => { setDebugMenuOpen(false); window.api.openDevTools(); },
    },
  ] : [];

  const titlebarClass = [
    'titlebar',
    hidden && !menuOpen && 'titlebar--hidden',
    hidden && !menuOpen && hovered && 'titlebar--peek',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={titlebarRef}
      className={titlebarClass}
      onMouseLeave={handleMouseLeave}
    >
      <div className="titlebar__left" ref={menuRef}>
        <IconButton
          variant="ghost"
          size="md"
          label="Menu"
          onClick={toggleMenu}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
          </svg>
        </IconButton>
        <IconButton
          variant="ghost"
          size="md"
          label={pinned ? 'Unpin window' : 'Pin window on top'}
          onClick={togglePin}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: pinned ? 1 : 0.4 }}>
            <path d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.342 1.174-.646 1.479-.126.125-.25.224-.354.298v4.431l.078.048c.203.127.476.314.751.555C12.36 7.775 13 8.527 13 9.5a.5.5 0 0 1-.5.5H8.5v5.5a.5.5 0 0 1-1 0V10H3.5a.5.5 0 0 1-.5-.5c0-.973.64-1.725 1.17-2.189A6 6 0 0 1 5 6.708V2.277a3 3 0 0 1-.354-.298C4.342 1.674 4 1.179 4 .5a.5.5 0 0 1 .146-.354" />
          </svg>
        </IconButton>
        <IconButton
          variant="ghost"
          size="md"
          label={isMuted ? 'Unmute' : 'Mute'}
          onClick={toggleMute}
        >
          {isMuted ? (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 1 }}>
              <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06M14.354 4.646a.5.5 0 0 1 0 .708L12.707 7l1.647 1.646a.5.5 0 0 1-.708.708L12 7.707l-1.646 1.647a.5.5 0 0 1-.708-.708L11.293 7 9.646 5.354a.5.5 0 1 1 .708-.708L12 6.293l1.646-1.647a.5.5 0 0 1 .708 0" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.4 }}>
              <path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303z" />
              <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.611 3.889z" />
              <path d="M8.707 11.182A4.5 4.5 0 0 0 10.025 8a4.5 4.5 0 0 0-1.318-3.182L8 5.525A3.5 3.5 0 0 1 9.025 8 3.5 3.5 0 0 1 8 10.475zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06" />
            </svg>
          )}
        </IconButton>
        {gameRunning && (
          <IconButton
            variant="ghost"
            size="md"
            label="Save States"
            onClick={onToggleSaveStates}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.7 }}>
              <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4.414A1 1 0 0 0 14.707 4L12 1.293A1 1 0 0 0 11.293 1H2zm0 1h1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V2.414L14 5.414V14H2V2zm3 0v3h4V2H5z" />
            </svg>
          </IconButton>
        )}
        {menuOpen && <DropdownMenu items={menuItems} anchorRef={menuRef} />}
        {window.api.isDev && (
          <div ref={debugMenuRef} style={{ position: 'relative', display: 'inline-flex' }}>
            <IconButton
              variant="ghost"
              size="md"
              label="Debug"
              onClick={() => setDebugMenuOpen(v => !v)}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.6 }}>
                <path d="M4.355.522a.5.5 0 0 1 .623.333l.291.956A5 5 0 0 1 8 1c1.007 0 1.946.298 2.731.811l.29-.956a.5.5 0 1 1 .957.29l-.41 1.352A5 5 0 0 1 13 6h.5a.5.5 0 0 1 0 1H13v1h.5a.5.5 0 0 1 0 1H13a5 5 0 0 1-10 0h-.5a.5.5 0 0 1 0-1H3V7h-.5a.5.5 0 0 1 0-1H3a5 5 0 0 1 1.432-3.503l-.41-1.352a.5.5 0 0 1 .333-.623M6 7v1h4V7zm0 2v1h4V9z" />
              </svg>
            </IconButton>
            {debugMenuOpen && <DropdownMenu items={debugMenuItems} anchorRef={debugMenuRef} />}
          </div>
        )}
        {showFps && fps > 0 && (
          <span className="titlebar__fps">{fps} FPS</span>
        )}
      </div>

      <div className="titlebar__center">
        <span className="titlebar__title">ALttP Randomizer</span>
      </div>

      <WindowControls isMaximized={isMaximized} />
    </div>
  );
}

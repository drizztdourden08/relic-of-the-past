import { useRef, useState, useEffect, useCallback } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { DropdownMenu } from '../../composites/DropdownMenu';
import { IconButton } from '../../primitives/IconButton';
import { useTitleBar } from './behavior/useTitleBar';
import { WindowControls } from './sub-components/WindowControls';
import { getFps } from '../../../lib/game';
import './TitleBar.css';
import type { TitleBarProps } from './types';


const TitleBar = (props: TitleBarProps) => {
  const {
    onImportRom,
    onSwitchProfile,
    onShowProfile,
    onShowLogs,
    onToggleSaveStates,
    onToggleInventory,
    onToggleChecks,
    onToggleDebug,
    onToggleCheats,
    onShowDataManager,
    onShowInputTester,
    onShowCredits,
    onShowSpriteDebug,
    onShowConnectionDebug,
    onShowShadowEditor,
    onShowAbout,
    activeProfile,
    gameRunning,
    windowMode = 'default',
    isMuted = false,
    onToggleMute,
    showFps = false,
    updateAvailable = false,
    onUpdateClick,
    onCheckForUpdates,
  } = props;
  const menuRef = useRef<HTMLDivElement>(null);
  const { isMaximized, menuOpen, toggleMenu, closeMenu } = useTitleBar(menuRef);
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
      key: 'widgets',
      icon: '🔧',
      label: 'Widgets',
      children: [
        { key: 'inventory', icon: '🎒', label: 'Inventory Tracker', onClick: () => { closeMenu(); onToggleInventory(); } },
        { key: 'checks', icon: '🗺️', label: 'Checks Tracker', onClick: () => { closeMenu(); onToggleChecks(); } },
        { key: 'cheats', icon: '⚡', label: 'Cheats', onClick: () => { closeMenu(); onToggleCheats(); } },
        { key: 'logs', icon: '📋', label: 'Logs', onClick: () => { closeMenu(); onShowLogs(); } },
        { key: 'debug', icon: '🐛', label: 'Debug State', onClick: () => { closeMenu(); onToggleDebug(); } },
        { key: 'navigation', icon: '🔗', label: 'Location & Navigation', onClick: () => { closeMenu(); onShowConnectionDebug(); } },
      ],
    },
    {
      key: 'advanced',
      icon: '⚙️',
      label: 'Advanced',
      children: [
        { key: 'input-tester', icon: '🎮', label: 'Input Calibration', onClick: () => { closeMenu(); onShowInputTester(); } },
        { key: 'check-updates', icon: '🔄', label: 'Check for Updates', onClick: () => { closeMenu(); onCheckForUpdates?.(); } },
        { key: 'dev-console', icon: '🛠️', label: 'Dev Console', onClick: () => { closeMenu(); window.api.openDevTools(); } },
        { key: 'sprite-debug', icon: '🖼️', label: 'Sprite Debug', onClick: () => { closeMenu(); onShowSpriteDebug(); } },
        ...(window.api.isDev ? [{ key: 'shadow-editor', icon: '🌓', label: 'Shadow Editor', onClick: () => { closeMenu(); onShowShadowEditor(); } }] : []),
      ],
    },
    'separator',
    {
      key: 'credits',
      icon: '📜',
      label: 'Credits',
      onClick: () => { closeMenu(); onShowCredits(); },
    },
    {
      key: 'about',
      icon: 'ℹ️',
      label: 'About',
      onClick: () => { closeMenu(); onShowAbout(); },
    },
    { key: 'quit', icon: '✕', label: 'Quit', onClick: () => window.api.close() },
  ];



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
        {showFps && fps > 0 && (
          <span className="titlebar__fps">{fps} FPS</span>
        )}
      </div>

      <div className="titlebar__center">
        <img className="titlebar__logo" src="./logos/logo-128.png" alt="" />
        <span className="titlebar__title">Relic of the Past</span>
        <img className="titlebar__logo" src="./logos/logo-128.png" alt="" />
        {updateAvailable && (
          <button className="titlebar__update-badge" onClick={onUpdateClick}>
            Update available
          </button>
        )}
      </div>

      <WindowControls isMaximized={isMaximized} />
    </div>
  );
};

export { TitleBar };

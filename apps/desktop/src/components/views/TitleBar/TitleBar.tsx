import { useRef, useState, useEffect } from 'react';
import { DropdownMenu } from '../../composites/DropdownMenu';
import { IconButton } from '../../primitives/IconButton';
import { useTitleBar } from './behavior/useTitleBar';
import { WindowControls } from './sub-components/WindowControls';
import './TitleBar.css';

interface TitleBarProps {
  onImportRom: () => void;
  onSwitchProfile: () => void;
  onShowProfile: () => void;
  onShowLogs: () => void;
  activeProfile: Profile | null;
}

export function TitleBar({
  onImportRom,
  onSwitchProfile,
  onShowProfile,
  onShowLogs,
  activeProfile,
}: TitleBarProps): JSX.Element {
  const menuRef = useRef<HTMLDivElement>(null);
  const { isMaximized, menuOpen, toggleMenu, closeMenu } = useTitleBar(menuRef);
  const [pinned, setPinned] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    window.api.isAudioMuted().then(setMuted);
  }, []);

  const togglePin = async () => {
    const result = await window.api.setAlwaysOnTop(!pinned);
    setPinned(result);
  };

  const toggleMute = async () => {
    const result = await window.api.setAudioMuted(!muted);
    setMuted(result);
  };

  const menuItems: (Parameters<typeof DropdownMenu>[0]['items'][number])[] = [
    {
      key: 'home',
      icon: '🏠',
      label: 'Home',
      description: 'View active profile',
      disabled: !activeProfile,
      onClick: () => { closeMenu(); onShowProfile(); },
    },
    {
      key: 'import',
      icon: '📁',
      label: 'Import ROM',
      description: 'Add a new ROM file to the library',
      onClick: () => { closeMenu(); onImportRom(); },
    },
    {
      key: 'switch',
      icon: '🎮',
      label: activeProfile ? 'Switch Profile' : 'New Profile',
      description: activeProfile
        ? 'Choose a different profile or create a new one'
        : 'Create a new save profile for a ROM',
      onClick: () => { closeMenu(); onSwitchProfile(); },
    },
    'separator',
    {
      key: 'logs',
      icon: '📋',
      label: 'Show Logs',
      description: 'Toggle the log overlay',
      onClick: () => { closeMenu(); onShowLogs(); },
    },
    { key: 'settings', icon: '⚙️', label: 'Settings', description: 'Configure game and app settings', disabled: true },
    { key: 'about', icon: 'ℹ️', label: 'About', description: 'Version info and credits', disabled: true },
    'separator',
    { key: 'quit', icon: '✕', label: 'Quit', onClick: () => window.api.close() },
  ];

  return (
    <div className="titlebar">
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
          label={muted ? 'Unmute' : 'Mute'}
          onClick={toggleMute}
        >
          {muted ? (
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
        {menuOpen && <DropdownMenu items={menuItems} />}
      </div>

      <div className="titlebar__center">
        <span className="titlebar__title">ALttP Randomizer</span>
      </div>

      <WindowControls isMaximized={isMaximized} />
    </div>
  );
}

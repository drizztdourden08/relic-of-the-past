/* @layer renderer-components @kind component */
import { useRef, useState, useEffect, useCallback } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { usePlatform } from '@app/platform';
import { DropdownMenu } from '../../../../design-system/composites/DropdownMenu';
import { IconButton } from '../../../../design-system/primitives/IconButton';
import { Box } from '../../../../design-system/primitives/Box';
import { Button } from '../../../../design-system/primitives/Button';
import { Text } from '../../../../design-system/primitives/Text';
import { Image } from '../../../../design-system/primitives/Image';
import { Icon } from '../../../../design-system/primitives/Icon';
import { useTitleBar } from './behavior/useTitleBar';
import { buildTitleBarMenuItems } from './behavior/title-bar-menu';
import { WindowControls } from './sub-components/WindowControls';
import { getFps } from '../../../../../lib/game';
import './TitleBar.css';
import {
  MENU_ICON_CIRCLES, PIN_ICON_PATHS, MUTE_ICON_PATHS, VOLUME_ICON_PATHS, SAVE_ICON_PATHS,
} from './TitleBar.constants';
import type { TitleBarProps } from './TitleBar.type';


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
    onShowDesignGallery,
    onShowSpriteDebug,
    onShowConnectionDebug,
    onToggleDataset,
    onToggleSimulator,
    onShowShadowEditor,
    onShowAbout,
    activeProfile,
    gameRunning,
    widgetVisibility,
    windowMode = 'default',
    isMuted = false,
    onToggleMute,
    showFps = false,
    updateAvailable = false,
    onUpdateClick,
    onCheckForUpdates,
  } = props;
  const menuRef = useRef<HTMLDivElement>(null);
  const { window: win } = usePlatform();
  const { isMaximized, menuOpen, toggleMenu, closeMenu } = useTitleBar(menuRef);
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fps, setFps] = useState(0);
  const titlebarRef = useRef<HTMLDivElement>(null);

  // Track fullscreen state independently of windowMode
  useEffect(() => {
    win.isFullscreen().then(setIsFullscreen);
    return win.onFullscreenChange(setIsFullscreen);
  }, [win]);

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
    const result = await win.setAlwaysOnTop(!pinned);
    setPinned(result);
  };

  const toggleMute = () => {
    onToggleMute?.();
  };


  const menuItems = buildTitleBarMenuItems({
    closeMenu, win, activeProfile, gameRunning,
    onShowProfile, onToggleSaveStates, onShowDataManager, onToggleInventory, onToggleChecks,
    onToggleCheats, onShowLogs, onToggleDebug, onShowConnectionDebug, onToggleDataset, onToggleSimulator,
    onShowInputTester, onShowSpriteDebug, onShowShadowEditor, onCheckForUpdates, onShowCredits, onShowDesignGallery, onShowAbout,
    widgetVisibility,
  });



  const titlebarClass = [
    'titlebar',
    hidden && !menuOpen && 'titlebar--hidden',
    hidden && !menuOpen && hovered && 'titlebar--peek',
  ].filter(Boolean).join(' ');

  return (
    <Box
      ref={titlebarRef}
      className={titlebarClass}
      onMouseLeave={handleMouseLeave}
    >
      <Box className="titlebar__left" ref={menuRef}>
        <IconButton variant="ghost" size="sm" label="Menu" onClick={toggleMenu}>
          <Icon circles={MENU_ICON_CIRCLES} />
        </IconButton>
        <IconButton
          variant="ghost"
          size="sm"
          active={pinned}
          label={pinned ? 'Unpin window' : 'Pin window on top'}
          onClick={togglePin}
        >
          <Icon paths={PIN_ICON_PATHS} size={14} />
        </IconButton>
        <IconButton
          variant="ghost"
          size="sm"
          active={isMuted}
          label={isMuted ? 'Unmute' : 'Mute'}
          onClick={toggleMute}
        >
          {isMuted ? (
            <Icon paths={MUTE_ICON_PATHS} size={14} />
          ) : (
            <Icon paths={VOLUME_ICON_PATHS} size={14} />
          )}
        </IconButton>
        {gameRunning && (
          <IconButton variant="ghost" size="sm" label="Save States" onClick={onToggleSaveStates}>
            <Icon paths={SAVE_ICON_PATHS} size={14} />
          </IconButton>
        )}
        {updateAvailable && (
          <Button variant="bare" className="titlebar__update-badge" onClick={onUpdateClick}>
            Update available
          </Button>
        )}
        {menuOpen && <DropdownMenu items={menuItems} anchorRef={menuRef} />}
        {showFps && fps > 0 && (
          <Text className="titlebar__fps">{fps} FPS</Text>
        )}
      </Box>

      <Box className="titlebar__center">
        <Image className="titlebar__logo" src="./logos/logo-128.png" alt="" />
        <Text className="titlebar__title">Relic of the Past</Text>
        <Image className="titlebar__logo" src="./logos/logo-128.png" alt="" />
      </Box>

      <WindowControls isMaximized={isMaximized} />
    </Box>
  );
};

export { TitleBar };

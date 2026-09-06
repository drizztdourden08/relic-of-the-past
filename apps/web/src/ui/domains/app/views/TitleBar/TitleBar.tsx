/* @layer renderer-components @kind component */
import { useRef, useState, useEffect, useCallback } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { usePlatform } from '@app/platform';
import { DropdownMenu } from '../../../../design-system/composites/DropdownMenu';
import { IconButton } from '../../../../design-system/primitives/IconButton';
import { BugReportButton } from '../../compounds/BugReportButton';
import { Box } from '../../../../design-system/primitives/Box';
import { Button } from '../../../../design-system/primitives/Button';
import { Text } from '../../../../design-system/primitives/Text';
import { Image } from '../../../../design-system/primitives/Image';
import { Icon } from '../../../../design-system/primitives/Icon';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { useTitleBar } from './behavior/useTitleBar';
import { buildTitleBarMenuItems } from './behavior/title-bar-menu';
import { WindowControls } from './sub-components/WindowControls';
import { InstanceBadge } from './sub-components/InstanceBadge';
import { instanceName } from '../../../../../lib/instance';
import { getFps } from '../../../../../lib/game';
import { useSearchStore } from '../../../../../stores/search-store';
import { useRefreshRate } from '../../../../../hooks/useRefreshRate';
import { effectiveHz, isSyncedRate } from '@shared/display/refresh-rate';
import { RefreshRateTag } from './sub-components/RefreshRateTag';
import './TitleBar.css';
import {
  MENU_ICON_CIRCLES, PIN_ICON_PATHS, MUTE_ICON_PATHS, VOLUME_ICON_PATHS, SAVE_ICON_PATHS, SEARCH_ICON_PATHS,
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
    onShowSpriteDebug, onShowDataInspector,
    onShowConnectionDebug,
    onToggleDataset,
    onToggleSimulator,
    onToggleMusic,
    onShowShadowEditor,
    onShowAbout,
    onShowBugReport,
    activeProfile,
    gameRunning,
    widgetVisibility,
    developerToolsEnabled = false,
    windowMode = 'default',
    isMuted = false,
    onToggleMute,
    showFps = false,
    onShowDisplaySettings,
    updateAvailable = false,
    onUpdateClick,
    onCheckForUpdates,
  } = props;
  const menuRef = useRef<HTMLDivElement>(null);
  const { window: win } = usePlatform();
  const { isMaximized, menuOpen, toggleMenu, closeMenu } = useTitleBar(menuRef);
  const openSearch = useSearchStore((s) => s.openPalette);
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fps, setFps] = useState(0);
  // Shown beside the FPS so the two can be compared at a glance. The game runs at 60, and a
  // refresh rate that is not a whole multiple of that is what makes scrolling look uneven.
  const refreshHz = effectiveHz(useRefreshRate());
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
    onToggleCheats, onShowLogs, onToggleDebug, onShowConnectionDebug, onToggleDataset, onToggleSimulator, onToggleMusic,
    onShowInputTester, onShowSpriteDebug, onShowDataInspector, onShowShadowEditor, onCheckForUpdates, onShowCredits, onShowDesignGallery, onShowAbout,
    widgetVisibility, developerToolsEnabled,
  });



  // An automated launch wears the bot logo so a screenshot identifies itself.
  const instance = instanceName();
  const logoSrc = instance ? './logos/logo-bot-128.png' : './logos/logo-128.png';

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
          label="Search"
          className="titlebar__search"
          onClick={openSearch}
        >
          <Icon paths={SEARCH_ICON_PATHS} size={14} />
          <Text as="span" className="titlebar__search-spark" aria-hidden>✦</Text>
        </IconButton>
        <BugReportButton onClick={onShowBugReport} />
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
          <Text className="titlebar__fps">{fps} FPS{refreshHz !== null ? ` (${Math.round(refreshHz)} Hz)` : ''}</Text>
        )}
        {showFps && fps > 0 && !isSyncedRate(refreshHz) && refreshHz !== null && onShowDisplaySettings && (
          <RefreshRateTag onClick={onShowDisplaySettings} />
        )}
      </Box>

      <Box className="titlebar__center">
        <Image className="titlebar__logo" src={logoSrc} alt="" />
        <Text className="titlebar__title">Relic of the Past</Text>
        {instance && <InstanceBadge name={instance} />}
        <Image className="titlebar__logo" src={logoSrc} alt="" />
      </Box>

      <WindowControls isMaximized={isMaximized} />
    </Box>
  );
};

export { TitleBar };

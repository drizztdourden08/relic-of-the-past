/* @layer renderer-components @kind component */
import { usePlatform } from '@app/platform';
import { WindowTitleBar } from '@drizztdourden08/tessera/composites';
import { effectiveHz, isSyncedRate } from '@shared/display/refresh-rate';
import { instanceName } from '../../../../../lib/instance';
import { useSearchStore } from '../../../../../stores/search-store';
import { useRefreshRate } from '../../../../../hooks/useRefreshRate';
import { useFpsReadout } from './behavior/useFpsReadout';
import { useWindowState } from './behavior/useWindowState';
import { buildTitleBarMenuItems } from './behavior/title-bar-menu';
import { buildTitleBarActions } from './behavior/title-bar-actions';
import { NO_OP, TITLE_BAR_LOGO, TITLE_BAR_INSTANCE_LOGO } from './TitleBar.constants';
import type { TitleBarProps } from './TitleBar.type';

const TitleBar = (props: TitleBarProps) => {
  const { gameRunning, windowMode = 'default', isMuted = false, onToggleMute, showFps = false } = props;
  const { onShowDisplaySettings, updateAvailable = false, onUpdateClick, onShowBugReport, onToggleSaveStates } = props;
  const { window: win } = usePlatform();
  const { maximized, fullscreen, pinned, onControl } = useWindowState(win);
  const openSearch = useSearchStore((s) => s.openPalette);
  const refreshHz = effectiveHz(useRefreshRate());
  const { fps } = useFpsReadout(showFps, gameRunning);
  const instance = instanceName();

  const menu = buildTitleBarMenuItems({ ...props, closeMenu: NO_OP, win });
  const actions = buildTitleBarActions({
    onSearch: openSearch, onShowBugReport, isMuted, onToggleMute, gameRunning, onToggleSaveStates,
    updateAvailable, onUpdateClick, fps: showFps ? fps : 0, refreshHz, refreshSynced: isSyncedRate(refreshHz), onShowDisplaySettings,
  });

  return (
    <WindowTitleBar
      title="Relic of the Past"
      logo={TITLE_BAR_LOGO}
      instance={instance ? { name: instance, logo: TITLE_BAR_INSTANCE_LOGO } : null}
      menu={menu}
      actions={actions}
      maximized={maximized}
      fullscreen={fullscreen}
      pinned={pinned}
      onControl={onControl}
      concealed={windowMode === 'borderless'}
    />
  );
};

export { TitleBar };

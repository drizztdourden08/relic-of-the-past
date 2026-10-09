/* @layer renderer-components @kind logic */
import type { WindowTitleBarAction } from '@drizztdourden08/tessera/composites';
import { REFRESH_RATE_HINT } from './title-bar-actions.constants';
import type { TitleBarActionDeps } from './title-bar-actions.type';

const fpsStatus = (fps: number, refreshHz: number | null): string =>
  `${fps} FPS${refreshHz !== null ? ` (${Math.round(refreshHz)} Hz)` : ''}`;

const statusActions = (deps: TitleBarActionDeps): WindowTitleBarAction[] => {
  const { updateAvailable, onUpdateClick, fps, refreshHz, refreshSynced, onShowDisplaySettings } = deps;
  const actions: WindowTitleBarAction[] = [];
  if (updateAvailable && onUpdateClick) {
    actions.push({ id: 'update', label: 'Update available', icon: 'download', bar: 'status', status: 'Update available', tone: 'info', onSelect: onUpdateClick });
  }
  if (fps <= 0) return actions;
  actions.push({ id: 'fps', label: 'Frame rate', icon: 'monitor', bar: 'status', status: fpsStatus(fps, refreshHz), onSelect: () => onShowDisplaySettings?.() });
  if (!refreshSynced && refreshHz !== null && onShowDisplaySettings) {
    actions.push({
      id: 'refresh-rate', label: REFRESH_RATE_HINT, icon: 'triangle-alert', bar: 'status', status: 'Incompatible refresh rate',
      tone: 'danger', onSelect: onShowDisplaySettings,
    });
  }
  return actions;
};

const buildTitleBarActions = (deps: TitleBarActionDeps): WindowTitleBarAction[] => {
  const { onSearch, onShowBugReport, isMuted, onToggleMute, gameRunning, onToggleSaveStates } = deps;
  return [
    { id: 'search', label: 'Search', icon: 'search', shortcut: 'Ctrl+K', tone: 'primary', effect: 'twinkle', onSelect: onSearch },
    { id: 'report-bug', label: 'Report a bug', icon: 'bug', tone: 'danger', onSelect: onShowBugReport },
    { id: 'mute', label: isMuted ? 'Unmute' : 'Mute', icon: isMuted ? 'volume-x' : 'volume-2', onSelect: () => onToggleMute?.() },
    ...(gameRunning ? [{ id: 'save-states', label: 'Save States', icon: 'save' as const, onSelect: onToggleSaveStates }] : []),
    ...statusActions(deps),
  ];
};

export { buildTitleBarActions };

/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import { Box, Tabs } from '@drizztdourden08/tessera/primitives';
import type { TabItem } from '@drizztdourden08/tessera/primitives';
import { SchemeBanner } from './SchemeBanner';
import { GameControlsTab } from './GameControlsTab';
import { ModernControlsTab } from './ModernControlsTab';
import { ShortcutsTab } from './ShortcutsTab';
import { CheatBindingsTab } from './CheatBindingsTab';
import { CLASSIC_ONLY, CONTROLS_TAB_IDS, MODERN_ONLY } from './controls.constants';
import type { ControlsCtrl, ControlsMainProps } from './controls.type';

const buildTabs = (scheme: ControlsCtrl['scheme']): TabItem[] => [
  { id: 'controls', label: 'Game Controls', disabled: scheme === 'modern', disabledReason: CLASSIC_ONLY },
  { id: 'modern', label: 'Modern Controls', disabled: scheme === 'classic', disabledReason: MODERN_ONLY },
  { id: 'shortcuts', label: 'Shortcuts & Functions' },
  { id: 'cheats', label: 'Cheats' },
];

const ControlsMain = ({ ctrl, cheatsEnabled, onOpenCheatsSettings, onOpenHudStyle }: ControlsMainProps) => {
  const { setActiveTab } = ctrl;
  const tabs = useMemo(() => buildTabs(ctrl.scheme), [ctrl.scheme]);
  const handleTabChange = useCallback((id: string) => {
    const next = CONTROLS_TAB_IDS.find((tabId) => tabId === id);
    if (next) setActiveTab(next);
  }, [setActiveTab]);

  return (
    <Box className="controls-settings__main">
      {ctrl.scheme === 'classic' && <SchemeBanner onOpenHudStyle={onOpenHudStyle} />}

      <Tabs tabs={tabs} activeTab={ctrl.activeTab} onTabChange={handleTabChange} />

      {ctrl.activeTab === 'controls' && <GameControlsTab ctrl={ctrl} />}
      {ctrl.activeTab === 'modern' && <ModernControlsTab ctrl={ctrl} />}
      {ctrl.activeTab === 'shortcuts' && <ShortcutsTab ctrl={ctrl} />}
      {ctrl.activeTab === 'cheats' && (
        <CheatBindingsTab ctrl={ctrl} cheatsEnabled={cheatsEnabled} onOpenCheatsSettings={onOpenCheatsSettings} />
      )}
    </Box>
  );
};

export { ControlsMain };

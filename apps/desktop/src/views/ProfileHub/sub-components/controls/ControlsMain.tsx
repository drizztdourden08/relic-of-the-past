/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import { Box, ScrollArea, Tabs } from '@drizztdourden08/tessera/primitives';
import type { TabItem } from '@drizztdourden08/tessera/primitives';
import { GameControlsTab } from './GameControlsTab';
import { ModernControlsTab } from './ModernControlsTab';
import { ShortcutsTab } from './ShortcutsTab';
import { CheatBindingsTab } from './CheatBindingsTab';
import { OptionsTab } from './OptionsTab';
import { CONTROLS_TAB_IDS, MODERN_ONLY, VANILLA_ONLY } from './controls.constants';
import type { ControlsCtrl, ControlsMainProps } from './controls.type';

const buildTabs = (scheme: ControlsCtrl['scheme'], experimental: boolean): TabItem[] => [
  { id: 'controls', label: 'Vanilla Controls', disabled: scheme === 'modern', disabledReason: VANILLA_ONLY },
  ...(experimental ? [{ id: 'modern', label: 'Modern Controls', disabled: scheme === 'classic', disabledReason: MODERN_ONLY }] : []),
  { id: 'shortcuts', label: 'Shortcuts & Functions' },
  { id: 'cheats', label: 'Cheats' },
  { id: 'options', label: 'Options' },
];

const ControlsMain = ({ ctrl, cheatsEnabled, onOpenCheatsSettings, experimental }: ControlsMainProps) => {
  const { setActiveTab } = ctrl;
  const tabs = useMemo(() => buildTabs(ctrl.scheme, experimental), [ctrl.scheme, experimental]);
  const handleTabChange = useCallback((id: string) => {
    const next = CONTROLS_TAB_IDS.find((tabId) => tabId === id);
    if (next) setActiveTab(next);
  }, [setActiveTab]);

  return (
    <Box className="controls-settings__main">
      <Tabs tabs={tabs} activeTab={ctrl.activeTab} onTabChange={handleTabChange} />
      <ScrollArea className="controls-settings__body">
        {ctrl.activeTab === 'controls' && <GameControlsTab ctrl={ctrl} />}
        {experimental && ctrl.activeTab === 'modern' && <ModernControlsTab ctrl={ctrl} />}
        {ctrl.activeTab === 'shortcuts' && <ShortcutsTab ctrl={ctrl} />}
        {ctrl.activeTab === 'cheats' && (
          <CheatBindingsTab ctrl={ctrl} cheatsEnabled={cheatsEnabled} onOpenCheatsSettings={onOpenCheatsSettings} />
        )}
        {ctrl.activeTab === 'options' && <OptionsTab ctrl={ctrl} />}
      </ScrollArea>
    </Box>
  );
};

export { ControlsMain };

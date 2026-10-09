/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { ControlsTabs } from './ControlsTabs';
import { SchemeBanner } from './SchemeBanner';
import { GameControlsTab } from './GameControlsTab';
import { ModernControlsTab } from './ModernControlsTab';
import { ShortcutsTab } from './ShortcutsTab';
import { CheatBindingsTab } from './CheatBindingsTab';
import { CLASSIC_ONLY, MODERN_ONLY } from './controls.constants';
import type { ControlsCtrl, ControlsMainProps, ControlsTabItem } from './controls.type';

const buildTabs = (scheme: ControlsCtrl['scheme']): ControlsTabItem[] => [
  { id: 'controls', label: 'Game Controls', disabled: scheme === 'modern', reason: CLASSIC_ONLY },
  { id: 'modern', label: 'Modern Controls', disabled: scheme === 'classic', reason: MODERN_ONLY },
  { id: 'shortcuts', label: 'Shortcuts & Functions' },
  { id: 'cheats', label: 'Cheats' },
];

const ControlsMain = ({ ctrl, cheatsEnabled, onOpenCheatsSettings, onOpenHudStyle }: ControlsMainProps) => {
  const tabs = useMemo(() => buildTabs(ctrl.scheme), [ctrl.scheme]);
  return (
    <Box className="controls-settings__main">
      {ctrl.scheme === 'classic' && <SchemeBanner onOpenHudStyle={onOpenHudStyle} />}

      <ControlsTabs tabs={tabs} activeTab={ctrl.activeTab} onTabChange={ctrl.setActiveTab} />

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

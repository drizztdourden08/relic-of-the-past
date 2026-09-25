/* @layer renderer-components @kind component */
/**
 * ControlsSettings center column: a banner where the scheme control used to be,
 * plus the tabbed binding editor.
 *
 * The scheme is DERIVED from the HUD style, so this screen has nothing to set
 * about it. Under Classic it says so once and links to where it is set, and
 * under Modern it says nothing at all. The two binding tabs still gate each
 * other by scheme: the inactive one stays visible and greyed with its reason,
 * never removed. Each tab's body lives in its own file; this one only picks
 * between them.
 */
import { Box } from '../../../../../../design-system/primitives/Box';
import { ControlsTabs } from './ControlsTabs';
import { SchemeBanner } from './SchemeBanner';
import { GameControlsTab } from './GameControlsTab';
import { ModernControlsTab } from './ModernControlsTab';
import { ShortcutsTab } from './ShortcutsTab';
import { CheatBindingsTab } from './CheatBindingsTab';
import type { ControlsTabItem } from './ControlsTabs';
import type { useControlsSettings } from '../useControlsSettings';

type Ctrl = ReturnType<typeof useControlsSettings>;

const CLASSIC_ONLY = 'Per-button mapping belongs to the Classic scheme; Modern binds the ten core verbs and derives the rest as slots.';
const MODERN_ONLY = 'Slots come with the Modern HUD style; this profile is on another style, so there are none to edit.';

const buildTabs = (scheme: Ctrl['scheme']): ControlsTabItem[] => [
  { id: 'controls', label: 'Game Controls', disabled: scheme === 'modern', reason: CLASSIC_ONLY },
  { id: 'modern', label: 'Modern Controls', disabled: scheme === 'classic', reason: MODERN_ONLY },
  { id: 'shortcuts', label: 'Shortcuts & Functions' },
  { id: 'cheats', label: 'Cheats' },
];

interface ControlsMainProps {
  ctrl: Ctrl;
  /** Whether the cheats master toggle is on. The bindings below no-op while it's off. */
  cheatsEnabled: boolean;
  /** Deep-links to the Enable Cheats setting. */
  onOpenCheatsSettings: () => void;
  /** Deep-links to the HUD Style setting, which is the only place the scheme is chosen. */
  onOpenHudStyle: () => void;
}

const ControlsMain = ({ ctrl, cheatsEnabled, onOpenCheatsSettings, onOpenHudStyle }: ControlsMainProps) => {
  return (
    <Box className="controls-settings__main">
      {ctrl.scheme === 'classic' && <SchemeBanner onOpenHudStyle={onOpenHudStyle} />}

      <ControlsTabs tabs={buildTabs(ctrl.scheme)} activeTab={ctrl.activeTab} onTabChange={ctrl.setActiveTab} />

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

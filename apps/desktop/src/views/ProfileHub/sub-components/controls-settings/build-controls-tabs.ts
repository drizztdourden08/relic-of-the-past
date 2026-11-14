/* @layer renderer-components @kind logic */
import { createElement } from 'react';
import type { ControlsTabDef } from '@drizztdourden08/brock-input/renderer';
import { remapAssignments } from '@rotp/input-mapping';
import { openSetting } from '@app/settings-nav/open-setting';
import { DISABLED_SETTING_MESSAGES } from '@app/settings-controls/disabled-setting-messages.constants';
import { assignmentLabel } from './assignment-label';
import { CHEAT_ACTION_DEFS, SHORTCUT_ACTION_DEFS, SNES_ACTIONS } from './action-defs.constants';
import { MODERN_ONLY, VANILLA_ONLY } from './controls-tabs.constants';
import { CORE_VERB_GROUPS } from './core-verbs.constants';
import { keyboardSlots } from './keyboard-slots';
import { SlotsFooter } from './SlotsFooter';
import { touchTab } from './touch-tab';
import type { BuildControlsTabsArgs } from './build-controls-tabs.type';

const openCheatsSettings = () => openSetting('cheatsEnabled');

const modernTab = ({ assignments, onChange }: BuildControlsTabsArgs, disabledReason: string | null): ControlsTabDef => ({
  id: 'modern',
  label: 'Modern Controls',
  kind: 'verbs',
  disabledReason,
  groups: CORE_VERB_GROUPS,
  slots: {
    assignmentLabel: (index) => assignmentLabel(assignments[index]),
    onRenumber: (renumber) => onChange({ modernScheme: { assignments: remapAssignments(assignments, renumber) } }),
    keyboardSlots,
    footer: (context) => createElement(SlotsFooter, { context, assignments }),
  },
});

const buildControlsTabs = (args: BuildControlsTabsArgs): readonly ControlsTabDef[] => {
  const { scheme, experimental, cheatsEnabled, hapticsEnabled, touch, mobile, onChange } = args;
  return [
    {
      id: 'controls',
      label: 'Vanilla Controls',
      kind: 'actions',
      scope: 'profile',
      actions: SNES_ACTIONS,
      middleLabel: 'SNES',
      acceptsDeviceDrop: true,
      disabledReason: scheme === 'modern' ? VANILLA_ONLY : null,
    },
    ...(experimental ? [modernTab(args, scheme === 'classic' ? MODERN_ONLY : null)] : []),
    {
      id: 'shortcuts',
      label: 'Shortcuts & Functions',
      kind: 'actions',
      scope: 'global',
      title: 'Keyboard Shortcuts',
      actions: SHORTCUT_ACTION_DEFS,
      reserved: [{ label: 'Open Menu', bindingLabel: 'Esc', glyph: 'kb-escape' }],
    },
    {
      id: 'cheats',
      label: 'Cheats',
      kind: 'actions',
      scope: 'global',
      title: 'Cheat Bindings',
      actions: CHEAT_ACTION_DEFS,
      gate: { active: !cheatsEnabled, message: DISABLED_SETTING_MESSAGES.cheatsEnabled ?? '', onOpenSettings: openCheatsSettings },
    },
    {
      id: 'options',
      label: 'Options',
      kind: 'options',
      haptics: { enabled: hapticsEnabled, onChange: (enabled) => onChange({ hapticsEnabled: enabled }) },
    },
    ...(mobile ? [touchTab({ touch, onChange })] : []),
  ];
};

export { buildControlsTabs };

/* @layer renderer-components @kind logic */
import { createElement } from 'react';
import type { ControlsTabDef } from '@drizztdourden08/brock-input/renderer';
import { remapAssignments } from '@rotp/input-mapping';
import { openSetting } from '@app/settings-nav/open-setting';
import { assignmentLabel } from './assignment-label';
import { SNES_ACTIONS } from './action-defs.constants';
import { cheatActionDefs } from './cheat-action-defs';
import { shortcutActionDefs } from './shortcut-action-defs';
import { coreVerbGroups } from './core-verbs.constants';
import { keyboardSlots } from './keyboard-slots';
import { SlotsFooter } from './SlotsFooter';
import { touchTab } from './touch-tab';
import type { BuildControlsTabsArgs } from './build-controls-tabs.type';

const openCheatsSettings = () => openSetting('cheatsEnabled');

const modernTab = ({ assignments, onChange, t }: BuildControlsTabsArgs, disabledReason: string | null): ControlsTabDef => ({
  id: 'modern',
  label: t('profiles:controls.tabs.modern'),
  kind: 'verbs',
  disabledReason,
  groups: coreVerbGroups(t),
  slots: {
    assignmentLabel: (index) => assignmentLabel(assignments[index], t),
    onRenumber: (renumber) => onChange({ modernScheme: { assignments: remapAssignments(assignments, renumber) } }),
    keyboardSlots,
    footer: (context) => createElement(SlotsFooter, { context, assignments }),
  },
});

const buildControlsTabs = (args: BuildControlsTabsArgs): readonly ControlsTabDef[] => {
  const { scheme, experimental, cheatsEnabled, hapticsEnabled, touch, mobile, onChange, cheatsOffMessage, t, text } = args;
  return [
    {
      id: 'controls',
      label: t('profiles:controls.tabs.vanilla'),
      kind: 'actions',
      scope: 'profile',
      actions: SNES_ACTIONS,
      middleLabel: t('profiles:controls.tabs.snes'),
      acceptsDeviceDrop: true,
      disabledReason: scheme === 'modern' ? t('profiles:controls.tabs.vanilla-only') : null,
    },
    ...(experimental ? [modernTab(args, scheme === 'classic' ? t('profiles:controls.tabs.modern-only') : null)] : []),
    {
      id: 'shortcuts',
      label: t('profiles:controls.tabs.shortcuts'),
      kind: 'actions',
      scope: 'global',
      title: t('profiles:controls.tabs.shortcuts-title'),
      actions: shortcutActionDefs(text),
      reserved: [{ label: t('profiles:controls.tabs.open-menu'), bindingLabel: 'Esc', glyph: 'kb-escape' }],
    },
    {
      id: 'cheats',
      label: t('profiles:controls.tabs.cheats'),
      kind: 'actions',
      scope: 'global',
      title: t('profiles:controls.tabs.cheats-title'),
      actions: cheatActionDefs(text),
      gate: { active: !cheatsEnabled, message: cheatsOffMessage, onOpenSettings: openCheatsSettings },
    },
    {
      id: 'options',
      label: t('profiles:controls.tabs.options'),
      kind: 'options',
      haptics: { enabled: hapticsEnabled, onChange: (enabled) => onChange({ hapticsEnabled: enabled }) },
    },
    ...(mobile ? [touchTab({ touch, onChange }, t)] : []),
  ];
};

export { buildControlsTabs };

/* @layer renderer-components @kind logic */
import type { SettingsSectionRow } from '@drizztdourden08/tessera/composites';

const hapticsRows = (enabled: boolean, onChange: (enabled: boolean) => void): SettingsSectionRow[] => [
  {
    id: 'haptics',
    title: 'Haptics',
    description: 'Every controller assigned to this profile rumbles for game events.',
    keywords: 'haptics rumble vibration controller',
    input: { kind: 'toggle', value: enabled, onChange },
  },
];

export { hapticsRows };

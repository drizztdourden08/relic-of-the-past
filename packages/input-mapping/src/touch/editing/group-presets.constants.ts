/* @layer shared-input @kind constants */
import { ROUND_FORM } from './button-forms.constants';
import type { GroupPreset, GroupPresetId } from './group-preset.type';

const GROUP_PRESETS: Readonly<Record<GroupPresetId, GroupPreset>> = {
  face: {
    label: 'Face buttons',
    scale: 1,
    spacing: 0.95,
    form: ROUND_FORM,
    members: [
      { emit: 'a', dx: 1, dy: 0 },
      { emit: 'b', dx: 0, dy: 1 },
      { emit: 'x', dx: 0, dy: -1 },
      { emit: 'y', dx: -1, dy: 0 },
    ],
  },
  dpad: {
    label: 'D-pad',
    scale: 0.85,
    spacing: 0.85,
    form: ROUND_FORM,
    members: [
      { emit: 'up', dx: 0, dy: -1 },
      { emit: 'down', dx: 0, dy: 1 },
      { emit: 'left', dx: -1, dy: 0 },
      { emit: 'right', dx: 1, dy: 0 },
    ],
  },
};

const GROUP_PRESET_IDS: readonly GroupPresetId[] = ['face', 'dpad'];

export { GROUP_PRESETS, GROUP_PRESET_IDS };

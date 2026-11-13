/* @layer shared-input @kind types */
import type { TouchButtonForm, TouchEmit } from '@rotp/features';

type GroupPresetId = 'face' | 'dpad';

interface GroupPresetMember {
  emit: TouchEmit;
  dx: number;
  dy: number;
}

interface GroupPreset {
  label: string;
  scale: number;
  spacing: number;
  form: TouchButtonForm;
  members: readonly GroupPresetMember[];
}

export type { GroupPreset, GroupPresetId, GroupPresetMember };

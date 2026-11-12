/* @layer shared-input @kind types */
import type { TouchButtonShape, TouchEmit } from '@rotp/features';

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
  shape: TouchButtonShape;
  members: readonly GroupPresetMember[];
}

export type { GroupPreset, GroupPresetId, GroupPresetMember };

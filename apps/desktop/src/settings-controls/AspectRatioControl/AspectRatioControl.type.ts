/* @layer renderer-components @kind types */
import type { GameSettings } from '@rotp/features';
import type { SegmentOption } from '@drizztdourden08/tessera/primitives';
import type { PRESET_GROUP_IDS } from './AspectRatioControl.constants';

interface AspectRatioControlProps {
  label: string;
  description?: string;
  value: string;
  options: SegmentOption[];
  presetOptions?: SegmentOption[];
  widePresets?: SegmentOption[];
  tallPresets?: SegmentOption[];
  descriptions?: Record<string, string>;
  recommendedValue?: string;
  recommendedNote?: string;
  customW: number;
  customH: number;
  ratioKey: 'aspectRatio' | 'hudRatio';
  wKey: 'customAspectW' | 'customHudAspectW';
  hKey: 'customAspectH' | 'customHudAspectH';
  renderIntoNotch?: boolean;
  onChange: (patch: Partial<GameSettings>) => void;
}

type PresetGroupId = (typeof PRESET_GROUP_IDS)[number];

type PresetGroups = Readonly<Record<PresetGroupId, SegmentOption[] | undefined>>;

export type { AspectRatioControlProps, PresetGroupId, PresetGroups };

/* @layer renderer-components @kind types */
import type { GameSettings } from '@shared/types/settings';
import type { SegmentOption } from '../../../../../design-system/primitives/SegmentedControl';

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

export type { AspectRatioControlProps };

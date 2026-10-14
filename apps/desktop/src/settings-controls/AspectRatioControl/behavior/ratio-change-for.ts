/* @layer renderer-components @kind logic */
import type { GameSettings } from '@rotp/features';
import { detectScreenRatio } from '@rotp/game-core';
import { PRESET_FALLBACK, PRESET_GROUP_IDS } from '../AspectRatioControl.constants';
import type { PresetGroupId } from '../AspectRatioControl.type';
import type { RatioChangeParams } from './ratio-change-for.type';

const isPresetGroup = (next: string): next is PresetGroupId => PRESET_GROUP_IDS.some((id) => id === next);

const ratioChangeFor = (next: string, params: RatioChangeParams): Partial<GameSettings> => {
  const { value, groups, customW, customH, renderIntoNotch, ratioKey, wKey, hKey } = params;
  if (isPresetGroup(next)) {
    const options = groups[next];
    const fallback = options?.[0]?.value ?? PRESET_FALLBACK[next];
    return { [ratioKey]: options?.some((option) => option.value === value) ? value : fallback };
  }
  if (next === 'custom' && !(customW > 0 && customH > 0)) {
    const d = detectScreenRatio(renderIntoNotch);
    return { [ratioKey]: 'custom', [wKey]: d.w, [hKey]: d.h };
  }
  return { [ratioKey]: next };
};

export { ratioChangeFor };

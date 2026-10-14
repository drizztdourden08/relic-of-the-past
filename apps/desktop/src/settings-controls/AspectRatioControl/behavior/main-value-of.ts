/* @layer renderer-components @kind logic */
import { PRESET_GROUP_IDS } from '../AspectRatioControl.constants';
import type { PresetGroups } from '../AspectRatioControl.type';

const mainValueOf = (value: string, groups: PresetGroups): string =>
  PRESET_GROUP_IDS.find((id) => groups[id]?.some((option) => option.value === value)) ?? value;

export { mainValueOf };

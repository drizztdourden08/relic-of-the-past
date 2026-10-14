/* @layer renderer-components @kind types */
import type { AspectRatioControlProps, PresetGroups } from '../AspectRatioControl.type';

type RatioChangeParams = Pick<AspectRatioControlProps, 'value' | 'customW' | 'customH' | 'ratioKey' | 'wKey' | 'hKey'> & {
  groups: PresetGroups;
  renderIntoNotch: boolean;
};

export type { RatioChangeParams };

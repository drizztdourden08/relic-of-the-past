/* @layer renderer-components @kind types */
import type { AspectRatioControlProps } from '../AspectRatioControl.type';

type RatioPairParams = Pick<AspectRatioControlProps, 'customW' | 'customH' | 'wKey' | 'hKey' | 'onChange'> & {
  renderIntoNotch: boolean;
};

export type { RatioPairParams };

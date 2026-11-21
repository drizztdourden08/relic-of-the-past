/* @layer renderer-components @kind types */
import type { Text } from '@drizztdourden08/brock-core/i18n';
type AlignPos = 'start' | 'center' | 'end';
type FlowDirection = 'row' | 'column';

type AlignValue = AlignPos | 'stretch' | 'between' | 'around' | 'evenly';

interface AlignOption {
  value: AlignValue;
  label: Text;
}

export type { AlignOption, AlignPos, AlignValue, FlowDirection };

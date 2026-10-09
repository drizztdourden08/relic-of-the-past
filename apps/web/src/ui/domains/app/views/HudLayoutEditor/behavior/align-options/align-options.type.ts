/* @layer renderer-components @kind types */
type AlignPos = 'start' | 'center' | 'end';
type FlowDirection = 'row' | 'column';

type AlignValue = AlignPos | 'stretch' | 'between' | 'around' | 'evenly';

interface AlignOption {
  value: AlignValue;
  label: string;
}

export type { AlignOption, AlignPos, AlignValue, FlowDirection };

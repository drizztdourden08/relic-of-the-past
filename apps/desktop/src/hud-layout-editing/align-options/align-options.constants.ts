/* @layer renderer-components @kind constants */
import type { AlignValue } from './align-options.type';

const OPTION: Readonly<Record<AlignValue, string>> = {
  start: 'start puts children at the beginning of the axis',
  center: 'center puts children in the middle of the axis',
  end: 'end puts children at the end of the axis',
  stretch: 'stretch makes children fill their cell along this axis',
  between: 'between puts the free space between the children, none at the ends',
  around: 'around gives each child an equal share, half of it at each side',
  evenly: 'evenly makes every gap the same, the two at the ends included',
};

const CSS_POSITION: Readonly<Record<AlignValue, string>> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'flex-start',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

export { CSS_POSITION, OPTION };

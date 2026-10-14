/* @layer renderer-components @kind logic */
import { hex } from '../hid-analysis';
import type { ByteCellTitleParams } from './ByteGrid.type';

const byteCellTitle = (params: ByteCellTitleParams): string => {
  const { index, value, status, pickMode, isPicked, activeItem } = params;
  const verb = isPicked ? 'deselect' : 'select';
  if (pickMode === 'stick') return `byte[${index}], click to ${verb} as stick axis`;
  if (pickMode === 'trigger') return `byte[${index}], click to ${verb} as trigger axis`;
  if (activeItem?.status === 'active') return `byte[${index}] = 0x${hex(value)} (${value}), click to assign to "${activeItem.label}"`;
  return `byte[${index}] = 0x${hex(value)} (${value}) is ${status}\nClick to toggle exclusion`;
};

export { byteCellTitle };

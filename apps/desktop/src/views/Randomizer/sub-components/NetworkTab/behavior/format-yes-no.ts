/* @layer renderer-components @kind logic */
import { DASH } from './network-format.constants';

const formatYesNo = (value: boolean | null): string => {
  if (value === null) return DASH;
  return value ? 'yes' : 'no';
};

export { formatYesNo };

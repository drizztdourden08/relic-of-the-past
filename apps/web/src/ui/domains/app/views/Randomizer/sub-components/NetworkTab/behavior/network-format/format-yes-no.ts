/* @layer renderer-components @kind logic */
import { DASH } from './network-format.constants';

const formatYesNo = (value: boolean | null): string => (value === null ? DASH : value ? 'yes' : 'no');

export { formatYesNo };

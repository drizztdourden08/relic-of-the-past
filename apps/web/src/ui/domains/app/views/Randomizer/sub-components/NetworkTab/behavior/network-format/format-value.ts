/* @layer renderer-components @kind logic */
import { DASH } from './network-format.constants';

const formatValue = (value: string | number | null): string => (value === null ? DASH : String(value));

export { formatValue };

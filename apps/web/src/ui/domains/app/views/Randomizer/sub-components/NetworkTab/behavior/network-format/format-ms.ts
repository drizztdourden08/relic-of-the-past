/* @layer renderer-components @kind logic */
import { DASH } from './network-format.constants';

const formatMs = (ms: number | null): string => (ms === null ? DASH : `${ms} ms`);

export { formatMs };

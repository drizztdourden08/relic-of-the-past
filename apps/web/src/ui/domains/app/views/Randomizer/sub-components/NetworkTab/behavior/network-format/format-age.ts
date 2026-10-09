/* @layer renderer-components @kind logic */
import { DASH } from './network-format.constants';
import { wholeSeconds } from './whole-seconds';

const formatAge = (at: number | null, now: number): string => (at === null ? DASH : `${wholeSeconds(now - at)} s ago`);

export { formatAge };

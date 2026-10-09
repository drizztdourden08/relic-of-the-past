/* @layer renderer-components @kind logic */
import { DASH } from './network-format.constants';
import { wholeSeconds } from './whole-seconds';

const formatCountdown = (at: number | null, now: number): string => (at === null ? DASH : `${wholeSeconds(at - now)} s`);

export { formatCountdown };

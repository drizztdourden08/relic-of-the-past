/* @layer renderer-components @kind logic */
import { formatDate } from '@drizztdourden08/tessera/primitives';
import { DASH } from './network-format.constants';

const formatAge = (at: number | null, now: number): string => (at === null ? DASH : formatDate(at, 'relative', { now }));

export { formatAge };

/* @layer renderer-components @kind logic */
import { formatDate as fmtDate } from '@drizztdourden08/brock-core';

const formatSessionDate = (ts: number): string => fmtDate(ts, 'session');

export { formatSessionDate };

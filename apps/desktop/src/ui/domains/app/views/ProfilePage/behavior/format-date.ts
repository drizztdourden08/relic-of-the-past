/* @layer renderer-components @kind logic */
import { formatDate as fmtDate } from '@drizztdourden08/brock-core';

const formatDate = (ts: number): string => fmtDate(ts, 'long');

export { formatDate };

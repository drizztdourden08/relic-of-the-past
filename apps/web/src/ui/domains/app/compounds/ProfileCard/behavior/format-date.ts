/* @layer renderer-components @kind logic */
import { formatDate as fmtDate } from '../../../../../../utils/formatDate';

const formatDate = (ts: number): string => fmtDate(ts, 'short');

export { formatDate };

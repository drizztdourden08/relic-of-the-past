/* @layer renderer-components @kind logic */
import { formatDate as fmtDate } from '../../../../../../utils/formatDate';

const formatSessionDate = (ts: number): string => fmtDate(ts, 'session');

export { formatSessionDate };

/* @layer renderer-components @kind logic */
import { formatRomName } from '../../../../../../utils/formatRomName';
import { formatDate as fmtDate } from '../../../../../../utils/formatDate';

const formatDate = (ts: number): string => fmtDate(ts, 'long');

export { formatDate, formatRomName };

/* @layer renderer-components @kind logic */
import { formatRomName } from '../../../../utils/formatRomName';

const formatDate = (ts: number): string => {
  if (!ts) return 'Never';
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

export { formatDate, formatRomName };

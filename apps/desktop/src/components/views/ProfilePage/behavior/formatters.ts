/* @layer renderer-components @kind logic */
import { formatRomName } from '../../../../utils/formatRomName';

const formatDate = (ts: number): string => {
  if (!ts) return 'Never';
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export { formatDate, formatRomName };

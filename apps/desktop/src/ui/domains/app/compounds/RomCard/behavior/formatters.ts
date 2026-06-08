/* @layer renderer-components @kind logic */
import { formatRomName } from '../../../../../../utils/formatRomName';

const formatSize = (bytes: number | null): string => {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export { formatRomName, formatSize };

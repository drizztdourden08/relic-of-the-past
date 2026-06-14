/* @layer renderer-components @kind logic */
import { formatRomName } from '../../../../../../utils/formatRomName';
import { formatBytes } from '../../../../../../utils/formatBytes';

const formatSize = (bytes: number | null): string => formatBytes(bytes, { nullText: '', kbDecimals: 0 });

export { formatRomName, formatSize };

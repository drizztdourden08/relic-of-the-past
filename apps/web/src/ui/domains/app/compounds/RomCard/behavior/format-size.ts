/* @layer renderer-components @kind logic */
import { formatBytes } from '../../../../../../utils/formatBytes';

const formatSize = (bytes: number | null): string => formatBytes(bytes, { nullText: '', kbDecimals: 0 });

export { formatSize };

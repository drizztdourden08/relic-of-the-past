/* @layer renderer-components @kind logic */
import { formatBytes } from '@drizztdourden08/brock-core';

const formatSize = (bytes: number | null): string => formatBytes(bytes, { nullText: '', kbDecimals: 0 });

export { formatSize };

/* @layer site-kit @kind logic */
import { formatBytes } from '../../format/format-bytes';

const formatRate = (bytesPerSecond: number): string => `${formatBytes(bytesPerSecond)}/s`;

export { formatRate };

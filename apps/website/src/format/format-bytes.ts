/* @layer website-site @kind logic */
import { GIGABYTE, KILOBYTE, MEGABYTE } from './format-bytes.constants';

const formatBytes = (bytes: number): string => {
  if (bytes >= GIGABYTE) return `${(bytes / GIGABYTE).toFixed(1)} GB`;
  if (bytes >= MEGABYTE) return `${(bytes / MEGABYTE).toFixed(1)} MB`;
  return `${Math.round(bytes / KILOBYTE)} KB`;
};

export { formatBytes };

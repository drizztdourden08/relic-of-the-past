/* @layer shared-store @kind logic */
import { PREFIX } from './keys.constants';
import type { MediaRole } from './keys.type';

const mediaKey = (itemId: string, role: MediaRole, sha8: string): string =>
  `${PREFIX.media}${itemId}/${role}-${sha8}.webp`;

export { mediaKey };

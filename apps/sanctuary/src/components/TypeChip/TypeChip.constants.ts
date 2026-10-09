/* @layer sanctuary-site @kind constants */
import type { FileType } from '@shared/sanctuary/file-types';
import type { ChipTone } from '@site-kit/components/Chip/Chip';

const TONES: Record<FileType, ChipTone> = {
  build: 'gold',
  'save-state': 'green',
  sprite: 'info',
  music: 'info',
  document: 'warning',
  other: 'neutral',
};

export { TONES };

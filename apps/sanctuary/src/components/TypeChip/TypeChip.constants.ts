/* @layer sanctuary-site @kind constants */
import type { TagLook } from '@drizztdourden08/tessera/primitives';
import type { FileType } from '@shared/sanctuary/file-types';

const LOOKS: Record<FileType, TagLook> = {
  build: { variant: 'category', color: 'amber' },
  'save-state': { variant: 'category', color: 'green' },
  sprite: { variant: 'category', color: 'cyan' },
  music: { variant: 'category', color: 'blue' },
  document: { variant: 'category', color: 'orange' },
  other: { color: 'neutral' },
};

export { LOOKS };

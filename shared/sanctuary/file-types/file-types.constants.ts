/* @layer shared-sanctuary @kind constants */
import type { FileType } from './file-types.type';

const FILE_TYPES = ['build', 'save-state', 'sprite', 'music', 'document', 'other'] as const;

const FILE_TYPE_LABELS: Record<FileType, string> = {
  build: 'Build',
  'save-state': 'Save state',
  sprite: 'Sprite',
  music: 'Music',
  document: 'Document',
  other: 'Other',
};

const FILE_TYPE_SHELF_LABELS: Record<FileType, string> = {
  build: 'Test builds',
  'save-state': 'Save states',
  sprite: 'Sprites & art',
  music: 'Music',
  document: 'Documents',
  other: 'Other',
};

export { FILE_TYPES, FILE_TYPE_LABELS, FILE_TYPE_SHELF_LABELS };

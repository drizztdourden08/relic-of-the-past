/* @layer sanctuary-site @kind component */
/** The pill that names a file type, one tone per type. */
import { FILE_TYPE_LABELS } from '@shared/sanctuary/file-types';
import type { FileType } from '@shared/sanctuary/file-types';
import { Chip } from '../Chip/Chip';
import type { ChipTone } from '../Chip/Chip';

type TypeChipProps = {
  type: FileType;
  className?: string;
};

const TONES: Record<FileType, ChipTone> = {
  build: 'gold',
  'save-state': 'green',
  sprite: 'info',
  music: 'info',
  document: 'warning',
  other: 'neutral',
};

const TypeChip = (props: TypeChipProps) => {
  const { type, className } = props;
  return <Chip tone={TONES[type]} className={className}>{FILE_TYPE_LABELS[type]}</Chip>;
};

export { TypeChip };
export type { TypeChipProps };

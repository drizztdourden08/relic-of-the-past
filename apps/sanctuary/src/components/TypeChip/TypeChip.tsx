/* @layer sanctuary-site @kind component */
import { FILE_TYPE_LABELS } from '@shared/sanctuary/file-types';
import { Chip } from '@site-kit/components/Chip/Chip';
import { TONES } from './TypeChip.constants';
import type { TypeChipProps } from './TypeChip.type';

const TypeChip = (props: TypeChipProps) => {
  const { type, className } = props;
  return <Chip tone={TONES[type]} className={className}>{FILE_TYPE_LABELS[type]}</Chip>;
};

export { TypeChip };

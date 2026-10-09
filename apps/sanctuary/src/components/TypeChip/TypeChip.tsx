/* @layer sanctuary-site @kind component */
import { Tag } from '@drizztdourden08/tessera/primitives';
import { FILE_TYPE_LABELS } from '@rotp/hub-contracts';
import { LOOKS } from './TypeChip.constants';
import type { TypeChipProps } from './TypeChip.type';

const TypeChip = (props: TypeChipProps) => {
  const { type, className } = props;
  return <Tag {...LOOKS[type]} className={className}>{FILE_TYPE_LABELS[type]}</Tag>;
};

export { TypeChip };

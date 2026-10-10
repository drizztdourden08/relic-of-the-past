/* @layer store-site @kind component */
import { Tag } from '@drizztdourden08/tessera/primitives';
import { KIND_LABELS } from '../../kinds/kinds.constants';
import type { KindChipProps } from './KindChip.type';
import { KIND_TONES } from './KindChip.constants';

const KindChip = (props: KindChipProps) => {
  const { kind, detail } = props;
  return <Tag color={KIND_TONES[kind]}>{detail ? `${KIND_LABELS[kind]} · ${detail}` : KIND_LABELS[kind]}</Tag>;
};

export { KindChip };
export type { KindChipProps } from './KindChip.type';

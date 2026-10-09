/* @layer store-site @kind component */
import { Chip } from '@site-kit/components/Chip/Chip';
import { KIND_LABELS } from '../../lib/kinds/kinds.constants';
import type { KindChipProps } from './KindChip.type';
import { KIND_TONES } from './KindChip.constants';

const KindChip = (props: KindChipProps) => {
  const { kind, detail } = props;
  return <Chip tone={KIND_TONES[kind]}>{detail ? `${KIND_LABELS[kind]} · ${detail}` : KIND_LABELS[kind]}</Chip>;
};

export { KindChip };
export type { KindChipProps } from './KindChip.type';

/* @layer site-kit @kind component */
import { Chip } from '../Chip/Chip';
import { TONES } from './AccessChip.constants';
import type { AccessChipProps } from './AccessChip.type';

const AccessChip = (props: AccessChipProps) => {
  const { state, className } = props;
  return <Chip tone={TONES[state]} className={className}>{state}</Chip>;
};

export { AccessChip };

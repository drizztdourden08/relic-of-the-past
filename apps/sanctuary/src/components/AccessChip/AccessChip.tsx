/* @layer sanctuary-site @kind component */
/** The pill that names an access state: member in green, admin in gold, pending in amber, revoked in red. */
import type { AccessState } from '@shared/sanctuary/types';
import { Chip } from '../Chip/Chip';
import type { ChipTone } from '../Chip/Chip';

type AccessChipProps = {
  state: AccessState;
  className?: string;
};

const TONES: Record<AccessState, ChipTone> = {
  admin: 'gold',
  member: 'green',
  pending: 'warning',
  revoked: 'danger',
};

const AccessChip = (props: AccessChipProps) => {
  const { state, className } = props;
  return <Chip tone={TONES[state]} className={className}>{state}</Chip>;
};

export { AccessChip };
export type { AccessChipProps };

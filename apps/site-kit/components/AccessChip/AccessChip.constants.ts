/* @layer site-kit @kind constants */
import type { AccessState } from '@shared/hub/types';
import type { ChipTone } from '../Chip/Chip.type';

const TONES: Record<AccessState, ChipTone> = {
  admin: 'gold',
  member: 'green',
  pending: 'warning',
  revoked: 'danger',
};

export { TONES };

/* @layer store-site @kind constants */
import type { ItemCardStatus } from '@drizztdourden08/tessera/composites';
import type { OwnedState } from './ItemCard.type';

const OWNED_STATUS: Record<OwnedState, ItemCardStatus> = {
  installed: { label: 'installed', tone: 'success' },
  update: { label: 'update', tone: 'primary' },
};

export { OWNED_STATUS };

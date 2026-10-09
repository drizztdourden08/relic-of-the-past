/* @layer store-site @kind types */
import type { StoreItem } from '@rotp/hub-contracts';
import type { PublicationTarget } from '../../../publications/publication-row';
import type { PublicationActions } from '../behavior/usePublicationActions.type';

type PublicationDetailProps = {
  item: StoreItem;
  target: PublicationTarget;
  actions: PublicationActions;
  onClose: () => void;
};

export type { PublicationDetailProps };

/* @layer store-site @kind types */
import type { StoreItem, StoreVersion } from '@rotp/hub-contracts';
import type { PublicationActions } from '../behavior/usePublicationActions.type';

type VersionActionsProps = {
  item: StoreItem;
  version: StoreVersion;
  actions: PublicationActions;
};

export type { VersionActionsProps };

/* @layer store-site @kind types */
import type { StoreItem } from '@rotp/hub-contracts';
import type { PrepareContext } from '@rotp/hub-client';
import type { PublishTarget } from './publish-target.type';

type StoreContext = PrepareContext<PublishTarget, StoreItem>;

export type { StoreContext };

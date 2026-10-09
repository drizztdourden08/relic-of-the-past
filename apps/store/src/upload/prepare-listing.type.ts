/* @layer store-site @kind types */
import type { StoreItem } from '@rotp/hub-contracts';
import type { PrepareContext } from '@site-kit/upload/upload-runner.type';
import type { PublishTarget } from './publish-target.type';

type StoreContext = PrepareContext<PublishTarget, StoreItem>;

export type { StoreContext };

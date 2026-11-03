/* @layer store-api @kind logic */
import { cardViewOf } from '@rotp/hub-contracts';
import type { ItemCardView, StoreItem } from '@rotp/hub-contracts';
import { liveVersionOf } from './versions';

const toCardView = (item: StoreItem): ItemCardView => cardViewOf(item, liveVersionOf(item)?.semver ?? null);

export { toCardView };

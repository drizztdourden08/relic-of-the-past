/* @layer store-api @kind logic */
import type { ItemChangeResponse, StoreItem } from '@rotp/hub-contracts';
import { signItem } from '../../media/sign-media';
import type { VersionRouteContext } from './version-routes.type';

const sendSignedItem = async ({ res }: VersionRouteContext, item: StoreItem): Promise<void> => {
  const body: ItemChangeResponse = { item: await signItem(item) };
  res.status(200).json(body);
};

export { sendSignedItem };

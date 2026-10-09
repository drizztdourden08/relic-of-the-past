/* @layer store-api @kind logic */
import { pairId, storeCollection } from './collections';

const installs = () => storeCollection('installs');

const ref = (itemId: string, userId: string) => installs().doc(pairId(itemId, userId));

const hasInstalled = async (itemId: string, userId: string): Promise<boolean> => (await ref(itemId, userId).get()).exists;

const installsRepo = { ref, hasInstalled };

export { installsRepo };

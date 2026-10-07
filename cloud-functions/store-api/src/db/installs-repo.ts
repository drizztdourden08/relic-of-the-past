/* @layer store-api @kind logic */
/** Installs, one per player per item, keyed `<itemId>_<userId>`. The download route writes
 *  them inside its install transaction; a rating needs one. */
import { pairId, storeCollection } from './collections';

const installs = () => storeCollection('installs');

const ref = (itemId: string, userId: string) => installs().doc(pairId(itemId, userId));

const hasInstalled = async (itemId: string, userId: string): Promise<boolean> => (await ref(itemId, userId).get()).exists;

const installsRepo = { ref, hasInstalled };

export { installsRepo };

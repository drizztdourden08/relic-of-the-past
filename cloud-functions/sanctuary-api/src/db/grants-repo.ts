/* @layer root-config @kind logic */
/** One doc per user the admin queue touched. A grant and a revoke are the same
 *  row with `revoked` flipped, so the last admin action is what the chain sees. */
import type { AccessGrant } from '../../../../shared/sanctuary';
import { collection } from './firestore';

type GrantDoc = AccessGrant & { revoked: boolean };

const grants = () => collection('grants');

const get = async (userId: string): Promise<GrantDoc | null> => {
  const snap = await grants().doc(userId).get();
  return snap.exists ? (snap.data() as GrantDoc) : null;
};

const set = async (doc: GrantDoc): Promise<void> => {
  await grants().doc(doc.userId).set(doc);
};

const grantsRepo = { get, set };

export { grantsRepo };
export type { GrantDoc };

/* @layer hub-core @kind logic */
import { collection } from './firestore';
import type { GrantDoc } from './grants-repo.type';

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
export type { GrantDoc } from './grants-repo.type';

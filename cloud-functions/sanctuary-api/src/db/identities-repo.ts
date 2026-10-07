/* @layer root-config @kind logic */
import type { Identity } from '../../../../shared/sanctuary';
import { collection } from './firestore';

const identities = () => collection('identities');

const get = async (id: string): Promise<Identity | null> => {
  const snap = await identities().doc(id).get();
  return snap.exists ? (snap.data() as Identity) : null;
};

const upsert = async (identity: Identity): Promise<void> => {
  await identities().doc(identity.id).set(identity);
};

const forUser = async (userId: string): Promise<Identity[]> => {
  const snap = await identities().where('userId', '==', userId).get();
  return snap.docs.map((doc) => doc.data() as Identity);
};

const remove = async (id: string): Promise<void> => {
  await identities().doc(id).delete();
};

const identitiesRepo = { get, upsert, forUser, remove };

export { identitiesRepo };

/* @layer root-config @kind logic */
/** Devices carry the device-code handshake in a `code` block that is cleared
 *  once the app has received its token, so the confirmed row is a plain Device. */
import type { Device } from '../../../../shared/sanctuary';
import { collection, now } from './firestore';

type CodeStatus = 'pending' | 'confirmed' | 'denied';
type DeviceCode = { userCode: string; pollSecretHash: string; expiresAt: number; status: CodeStatus };
type DeviceDoc = Device & { code: DeviceCode | null };

const devices = () => collection('devices');

const create = async (doc: DeviceDoc): Promise<void> => {
  await devices().doc(doc.id).set(doc);
};

const get = async (id: string): Promise<DeviceDoc | null> => {
  const snap = await devices().doc(id).get();
  return snap.exists ? (snap.data() as DeviceDoc) : null;
};

const byUserCode = async (userCode: string): Promise<DeviceDoc | null> => {
  const snap = await devices().where('code.userCode', '==', userCode).where('code.status', '==', 'pending').limit(1).get();
  return snap.empty ? null : (snap.docs[0].data() as DeviceDoc);
};

const byTokenHash = async (tokenHash: string): Promise<DeviceDoc | null> => {
  const snap = await devices().where('tokenHash', '==', tokenHash).limit(1).get();
  return snap.empty ? null : (snap.docs[0].data() as DeviceDoc);
};

const confirm = async (id: string, userId: string, label: string): Promise<void> => {
  await devices().doc(id).update({ userId, label, 'code.status': 'confirmed' });
};

/** Records the delivered token's hash and closes the handshake in one write. */
const deliverToken = async (id: string, tokenHash: string): Promise<void> => {
  await devices().doc(id).update({ tokenHash, code: null, lastSeenAt: now() });
};

const touch = async (id: string): Promise<void> => {
  await devices().doc(id).update({ lastSeenAt: now() });
};

const listForUser = async (userId: string): Promise<Device[]> => {
  const snap = await devices().where('userId', '==', userId).get();
  return snap.docs
    .map((doc) => doc.data() as DeviceDoc)
    .filter((doc) => doc.code === null)
    .map(({ code: _code, ...device }) => device)
    .sort((a, b) => b.createdAt - a.createdAt);
};

const revoke = async (id: string): Promise<void> => {
  await devices().doc(id).update({ revokedAt: now() });
};

const remove = async (id: string): Promise<void> => {
  await devices().doc(id).delete();
};

const devicesRepo = { create, get, byUserCode, byTokenHash, confirm, deliverToken, touch, listForUser, revoke, remove };

export { devicesRepo };
export type { DeviceDoc, DeviceCode, CodeStatus };

/* @layer root-config @kind logic */
import { Firestore } from '@google-cloud/firestore';

const db = new Firestore();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;

const checkRateLimit = async (ip: string): Promise<boolean> => {
  const ref = db.collection('rate-limits').doc(ip);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = Date.now();
    const data = snap.exists ? (snap.data() as { windowStart: number; count: number }) : { windowStart: now, count: 0 };
    const withinWindow = now - data.windowStart < WINDOW_MS;
    const count = withinWindow ? data.count : 0;
    const windowStart = withinWindow ? data.windowStart : now;
    if (count >= MAX_PER_WINDOW) return false;
    tx.set(ref, { windowStart, count: count + 1 });
    return true;
  });
};

export { checkRateLimit };

/* @layer root-config @kind logic */
// Same shape as report-issue/src/rate-limit.ts, own Firestore collection so an unrelated
// burst of bug reports never eats a player's debug-report quota or vice versa. A zip upload
// costs more (storage + bandwidth) than an issue post, so the window is tighter.
import { Firestore } from '@google-cloud/firestore';

const db = new Firestore();
const WINDOW_MS = 30 * 60 * 1000;
const MAX_PER_WINDOW = 3;

const checkRateLimit = async (ip: string): Promise<boolean> => {
  const ref = db.collection('debug-report-rate-limits').doc(ip);
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

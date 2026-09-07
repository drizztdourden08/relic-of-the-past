/* @layer electron-main @kind logic */
/**
 * In-memory cache of built-but-not-yet-uploaded debug report zips, keyed by a one-time token.
 * Building (collecting saves, encoding capture video, zipping) is local and can be slow;
 * sending is the only step that touches the network and can fail on its own. Splitting them
 * means a failed upload retries just the send, against the same cached zip, instead of
 * redoing all the local work. Entries past the TTL are dropped lazily on lookup, since a
 * report left unsent that long is better rebuilt fresh than sent stale.
 */
import { randomUUID } from 'crypto';

interface PendingReport {
  zip: Buffer;
  createdAt: number;
}

const TTL_MS = 15 * 60 * 1000;

const pending = new Map<string, PendingReport>();

const storePendingReport = (zip: Buffer): string => {
  const token = randomUUID();
  pending.set(token, { zip, createdAt: Date.now() });
  return token;
};

const getPendingReport = (token: string): Buffer | null => {
  const entry = pending.get(token);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > TTL_MS) {
    pending.delete(token);
    return null;
  }
  return entry.zip;
};

const dropPendingReport = (token: string): void => {
  pending.delete(token);
};

export { storePendingReport, getPendingReport, dropPendingReport };

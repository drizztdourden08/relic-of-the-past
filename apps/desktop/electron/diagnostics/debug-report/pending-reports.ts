/* @layer electron-main @kind logic */
/**
 * In-memory cache of built-but-not-yet-uploaded debug report zips, keyed by the report id
 * generated at build time. Building (collecting saves, encoding capture video, zipping) is
 * local and can be slow; sending is the only step that touches the network and can fail on
 * its own, and only happens once the GitHub issue carrying this id has been confirmed
 * created. Splitting them means a failed upload retries just the send, against the same
 * cached zip, instead of redoing all the local work. Entries past the TTL are dropped
 * lazily on lookup, since a report left unsent that long is better rebuilt fresh than sent
 * stale - the TTL is generous because the id also has to survive however long the user
 * spends filling in the bug-report form before submitting.
 */
interface PendingReport {
  zip: Buffer;
  createdAt: number;
}

const TTL_MS = 30 * 60 * 1000;

const pending = new Map<string, PendingReport>();

const storePendingReport = (reportId: string, zip: Buffer): void => {
  pending.set(reportId, { zip, createdAt: Date.now() });
};

const getPendingReport = (reportId: string): Buffer | null => {
  const entry = pending.get(reportId);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > TTL_MS) {
    pending.delete(reportId);
    return null;
  }
  return entry.zip;
};

const dropPendingReport = (reportId: string): void => {
  pending.delete(reportId);
};

export { storePendingReport, getPendingReport, dropPendingReport };

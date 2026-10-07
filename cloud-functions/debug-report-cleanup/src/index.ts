/* @layer root-config @kind logic */
/**
 * Daily sweep (Cloud Scheduler HTTP target, OIDC-authenticated): a .zip is deleted 30 days
 * after its linked GitHub issue closes. A report that never links to a closed issue would
 * otherwise live forever, so anything past a flat 90-day cap goes too regardless of issue
 * state. See docs/deploy.md in this folder for the scheduler wiring.
 */
import { http } from '@google-cloud/functions-framework';
import { Firestore } from '@google-cloud/firestore';
import { Storage } from '@google-cloud/storage';
import { findClosedIssueForReport } from './github-search';

const BUCKET_NAME = 'rotp-bugreports-debug-reports';
const RETENTION_AFTER_CLOSE_MS = 30 * 24 * 60 * 60 * 1000;
const ORPHAN_CAP_MS = 90 * 24 * 60 * 60 * 1000;

const db = new Firestore();
const storage = new Storage();

interface ReportDoc {
  uploadedAt: number;
  closedAt: number | null;
}

const isExpired = (doc: ReportDoc, now: number): boolean =>
  doc.closedAt !== null
    ? now - doc.closedAt > RETENTION_AFTER_CLOSE_MS
    : now - doc.uploadedAt > ORPHAN_CAP_MS;

http('debugReportCleanup', async (_req, res) => {
  const now = Date.now();
  const snapshot = await db.collection('debug-reports').get();
  let deleted = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data() as ReportDoc;
    let { closedAt } = data;

    if (closedAt === null) {
      const closed = await findClosedIssueForReport(docSnap.id);
      if (closed) {
        closedAt = closed.closedAt;
        await docSnap.ref.update({ closedAt });
      }
    }

    if (!isExpired({ ...data, closedAt }, now)) continue;

    await storage.bucket(BUCKET_NAME).file(`${docSnap.id}.zip`).delete({ ignoreNotFound: true });
    await docSnap.ref.delete();
    deleted += 1;
  }

  res.status(200).json({ checked: snapshot.size, deleted });
});

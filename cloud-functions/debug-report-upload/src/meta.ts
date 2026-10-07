/* @layer root-config @kind logic */
/** One Firestore doc per report: what the cleanup sweep (debug-report-cleanup) reads to decide
 *  when a .zip's retention clock starts. `closedAt` stays null until the sweep finds a closed
 *  GitHub issue carrying this report's id. */
import { Firestore } from '@google-cloud/firestore';

const db = new Firestore();

const recordReport = async (reportId: string, sizeBytes: number): Promise<void> => {
  await db.collection('debug-reports').doc(reportId).set({
    uploadedAt: Date.now(),
    sizeBytes,
    closedAt: null,
  });
};

export { recordReport };

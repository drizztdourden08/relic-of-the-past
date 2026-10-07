/* @layer root-config @kind logic */
/** Where the .zip itself lands. A separate bucket from anything else in the project, so its
 *  lifecycle (short-lived debug data) never gets mixed up with longer-lived storage. */
import { Storage } from '@google-cloud/storage';

const BUCKET_NAME = 'rotp-bugreports-debug-reports';

const storage = new Storage();

const objectPath = (reportId: string): string => `${reportId}.zip`;

const uploadReportZip = async (reportId: string, zip: Buffer): Promise<void> => {
  await storage.bucket(BUCKET_NAME).file(objectPath(reportId)).save(zip, { contentType: 'application/zip' });
};

export { uploadReportZip, BUCKET_NAME };

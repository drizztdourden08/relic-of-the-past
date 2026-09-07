/* @layer electron-main @kind logic */
// Public endpoint of the anonymous, rate-limited GCP relay (project rotp-bugreports),
// same trust model as REPORT_ISSUE_URL: not a secret, just an unauthenticated upload
// target with server-side size/rate limits. See cloud-functions/debug-report-upload.
import type { DebugReportUploadResult } from '@shared/types/debug-report';

const DEBUG_REPORT_UPLOAD_URL = 'https://us-central1-rotp-bugreports.cloudfunctions.net/uploadDebugReport';

const uploadDebugReportZip = async (zipBuffer: Buffer): Promise<DebugReportUploadResult> => {
  try {
    const res = await fetch(DEBUG_REPORT_UPLOAD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/zip' },
      body: new Uint8Array(zipBuffer),
    });
    if (!res.ok) return { error: `upload failed (${res.status})` };
    return (await res.json()) as DebugReportUploadResult;
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
};

export { uploadDebugReportZip, DEBUG_REPORT_UPLOAD_URL };

/* @layer electron-main @kind logic */
// Public endpoint of the anonymous, rate-limited GCP relay (project rotp-bugreports),
// same trust model as REPORT_ISSUE_URL: not a secret, just an unauthenticated upload
// target with server-side size/rate limits. See cloud-functions/debug-report-upload.
import type { DebugReportUploadResult } from '@shared/types/debug-report';

const DEBUG_REPORT_UPLOAD_URL = 'https://us-central1-rotp-bugreports.cloudfunctions.net/uploadDebugReport';

/** `reportId` is generated locally at build time (see ipc-handlers.ts) so it can be folded
 *  into the GitHub issue body before this ever runs; the server stores the zip under that
 *  same id instead of minting its own. */
const uploadDebugReportZip = async (reportId: string, zipBuffer: Buffer): Promise<DebugReportUploadResult> => {
  try {
    const res = await fetch(DEBUG_REPORT_UPLOAD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/zip', 'X-Report-Id': reportId },
      body: new Uint8Array(zipBuffer),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null) as { error?: string } | null;
      return { error: body?.error ?? `upload failed (${res.status})` };
    }
    return { reportId };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
};

export { uploadDebugReportZip, DEBUG_REPORT_UPLOAD_URL };

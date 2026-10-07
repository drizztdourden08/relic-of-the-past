/* @layer root-config @kind logic */
import { http } from '@google-cloud/functions-framework';
import { checkRateLimit } from './rate-limit';
import { uploadReportZip } from './storage';
import { recordReport } from './meta';

// Keeps a single unlucky report from dominating storage/egress cost; the client already caps
// what it packages (log files are launch-truncated/rotated, the capture ring buffer is bounded).
const MAX_BYTES = 20 * 1024 * 1024;

// The client generates this at package time (before the GitHub issue that names it even
// exists) and sends it back here once the issue is confirmed created, so the same id ends up
// in the issue body and the stored object/Firestore doc. Restricted to what that generator
// (a sliced crypto.randomUUID()) produces, which also keeps it safe as a storage path and a
// Firestore document id.
const REPORT_ID_RE = /^[0-9a-f-]{8,40}$/i;

http('uploadDebugReport', async (req, res) => {
  if (req.method !== 'POST') { res.status(405).send('Method not allowed'); return; }

  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0]?.trim() : undefined) ?? req.ip ?? 'unknown';

  if (!(await checkRateLimit(ip))) {
    res.status(429).json({ error: 'Too many reports. Try again later.' });
    return;
  }

  const reportIdHeader = req.headers['x-report-id'];
  const reportId = typeof reportIdHeader === 'string' ? reportIdHeader : null;
  if (!reportId || !REPORT_ID_RE.test(reportId)) {
    res.status(400).json({ error: 'Missing or invalid report id' });
    return;
  }

  // The Functions Framework always populates rawBody, regardless of content-type, which is
  // what a binary .zip upload needs (req.body only exists for content-types Express parses).
  const zip = req.rawBody;
  if (!zip || zip.length === 0) { res.status(400).json({ error: 'Empty upload' }); return; }
  if (zip.length > MAX_BYTES) { res.status(413).json({ error: 'Report too large' }); return; }

  try {
    await uploadReportZip(reportId, zip);
    await recordReport(reportId, zip.length);
    res.status(200).json({ reportId });
  } catch {
    res.status(502).json({ error: 'Failed to store report' });
  }
});

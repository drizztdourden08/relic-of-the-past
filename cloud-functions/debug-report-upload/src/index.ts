/* @layer root-config @kind logic */
import { http } from '@google-cloud/functions-framework';
import { randomUUID } from 'crypto';
import { checkRateLimit } from './rate-limit';
import { uploadReportZip } from './storage';
import { recordReport } from './meta';

// Keeps a single unlucky report from dominating storage/egress cost; the client already caps
// what it packages (log files are launch-truncated/rotated, the capture ring buffer is bounded).
const MAX_BYTES = 20 * 1024 * 1024;

http('uploadDebugReport', async (req, res) => {
  if (req.method !== 'POST') { res.status(405).send('Method not allowed'); return; }

  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0]?.trim() : undefined) ?? req.ip ?? 'unknown';

  if (!(await checkRateLimit(ip))) {
    res.status(429).json({ error: 'Too many reports. Try again later.' });
    return;
  }

  // The Functions Framework always populates rawBody, regardless of content-type, which is
  // what a binary .zip upload needs (req.body only exists for content-types Express parses).
  const zip = req.rawBody;
  if (!zip || zip.length === 0) { res.status(400).json({ error: 'Empty upload' }); return; }
  if (zip.length > MAX_BYTES) { res.status(413).json({ error: 'Report too large' }); return; }

  const reportId = randomUUID().slice(0, 12);
  try {
    await uploadReportZip(reportId, zip);
    await recordReport(reportId, zip.length);
    res.status(200).json({ reportId });
  } catch {
    res.status(502).json({ error: 'Failed to store report' });
  }
});

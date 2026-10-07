/* @layer root-config @kind logic */
import { http } from '@google-cloud/functions-framework';
import { checkRateLimit } from './rate-limit';
import { submitIssueReport } from './github';
import type { CreateIssueRequest } from './types';

http('reportIssue', async (req, res) => {
  if (req.method !== 'POST') { res.status(405).send('Method not allowed'); return; }

  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0]?.trim() : undefined) ?? req.ip ?? 'unknown';

  if (!(await checkRateLimit(ip))) {
    res.status(429).json({ error: 'Too many reports. Try again later.' });
    return;
  }

  try {
    const result = await submitIssueReport(req.body as CreateIssueRequest);
    res.status(200).json(result);
  } catch {
    res.status(502).json({ error: 'Failed to file issue' });
  }
});

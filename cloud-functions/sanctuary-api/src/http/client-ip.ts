/* @layer root-config @kind logic */
/** The caller's address as the Hosting rewrite and the Cloud Run front end
 *  report it: first hop of X-Forwarded-For, else what Express saw. */
import type { Request } from '@google-cloud/functions-framework';

const clientIp = (req: Request): string => {
  const forwardedFor = req.headers['x-forwarded-for'];
  const first = typeof forwardedFor === 'string' ? forwardedFor.split(',')[0]?.trim() : undefined;
  return first || req.ip || 'unknown';
};

export { clientIp };

/* @layer hub-core @kind logic */
import type { Request } from '@google-cloud/functions-framework';

const clientIp = (req: Request): string => {
  const forwardedFor = req.headers['x-forwarded-for'];
  const first = typeof forwardedFor === 'string' ? forwardedFor.split(',')[0]?.trim() : undefined;
  return first || req.ip || 'unknown';
};

export { clientIp };

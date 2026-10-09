/* @layer root-config @kind logic */
import type { Report } from '@rotp/hub-contracts';
import { expiryOf } from './expiry';

const isExpired = (report: Report, at: number): boolean => at >= expiryOf(report);

export { isExpired };

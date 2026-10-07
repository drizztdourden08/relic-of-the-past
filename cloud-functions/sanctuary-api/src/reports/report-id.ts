/* @layer root-config @kind logic */
/** The 12-hex-character id the app used to mint itself, now minted here so
 *  old issue bodies and new ones carry the same shape. */
import { randomUUID } from 'node:crypto';

const REPORT_ID_LENGTH = 12;
const REPORT_ID_RE = /^[0-9a-f]{8,40}$/;

const newReportId = (): string => randomUUID().replace(/-/g, '').slice(0, REPORT_ID_LENGTH);

const isReportId = (value: string): boolean => REPORT_ID_RE.test(value);

export { newReportId, isReportId };

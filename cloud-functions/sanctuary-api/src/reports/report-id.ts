/* @layer root-config @kind logic */
import { randomUUID } from 'node:crypto';
import { REPORT_ID_LENGTH } from './report-id.constants';

const newReportId = (): string => randomUUID().replace(/-/g, '').slice(0, REPORT_ID_LENGTH);

export { newReportId };

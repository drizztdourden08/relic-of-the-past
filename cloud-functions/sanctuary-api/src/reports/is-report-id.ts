/* @layer root-config @kind logic */
import { REPORT_ID_RE } from './report-id.constants';

const isReportId = (value: string): boolean => REPORT_ID_RE.test(value);

export { isReportId };

/* @layer root-config @kind logic */
import { detailsBlock } from './details-block';

const debugInfoBlock = (reportId: string, debugInfo: string): string =>
  detailsBlock('Debug info', `debug-report-id: ${reportId}\n\n${debugInfo}`.trim());

export { debugInfoBlock };

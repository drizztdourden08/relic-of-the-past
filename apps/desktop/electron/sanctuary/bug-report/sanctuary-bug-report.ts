/* @layer electron-main @kind logic */
import type { BugReportOptions } from '@drizztdourden08/brock-electron/main';
import { SANCTUARY_LABEL } from './bug-report.constants';
import { sanctuaryBugReportTransport } from './bug-report-transport';

const sanctuaryBugReport: BugReportOptions = {
  transport: sanctuaryBugReportTransport,
  label: SANCTUARY_LABEL,
  contact: true,
  attachments: true,
  afterSend: 'view',
};

export { sanctuaryBugReport };

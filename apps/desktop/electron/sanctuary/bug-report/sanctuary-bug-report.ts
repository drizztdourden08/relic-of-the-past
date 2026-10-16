/* @layer electron-main @kind logic */
import type { BugReportOptions } from '@drizztdourden08/brock-electron/main';
import { sanctuaryBugReportTransport } from './bug-report-transport';

const sanctuaryBugReport: BugReportOptions = {
  transport: sanctuaryBugReportTransport,
  contact: true,
  attachments: true,
  afterSend: 'view',
};

export { sanctuaryBugReport };

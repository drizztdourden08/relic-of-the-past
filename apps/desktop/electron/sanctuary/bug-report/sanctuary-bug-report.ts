/* @layer electron-main @kind logic */
import type { BugReportOptions } from '@drizztdourden08/brock-electron/main';
import { fetchMe } from '../../hub/identity';
import { SANCTUARY_API } from '../../hub/endpoints';
import { sanctuaryBugReportTransport } from './bug-report-transport';

const sanctuaryBugReport: BugReportOptions = {
  transport: sanctuaryBugReportTransport,
  contact: true,
  attachments: true,
  afterSend: 'view',
  identity: async () => (await fetchMe(SANCTUARY_API))?.user.displayName,
};

export { sanctuaryBugReport };

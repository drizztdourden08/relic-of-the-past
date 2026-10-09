/* @layer electron-main @kind logic */
import type { SanctuarySubmitInput, SanctuarySubmitResult } from '@app/ipc';
import { reportPageUrl } from '../report-page';
import { fileReport } from './file-report';
import { messageOf } from './message-of';

const submitReport = async ({ request }: SanctuarySubmitInput): Promise<SanctuarySubmitResult> => {
  try {
    const filed = await fileReport({ ...request, attachment: null });
    return { reportId: filed.reportId, issueUrl: filed.issueUrl, sanctuaryUrl: reportPageUrl(filed.reportId) };
  } catch (err) {
    return { error: messageOf(err, 'Could not file the report.') };
  }
};

export { submitReport };

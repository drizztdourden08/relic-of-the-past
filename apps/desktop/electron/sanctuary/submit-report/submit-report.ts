/* @layer electron-main @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { mainText } from '../../lib/main-text';
import type { SanctuarySubmitInput, SanctuarySubmitResult } from '@app/ipc';
import { reportPageUrl } from '../report-page';
import { fileReport } from './file-report';
import { messageOf } from './message-of';

const submitReport = async ({ request }: SanctuarySubmitInput): Promise<SanctuarySubmitResult> => {
  try {
    const filed = await fileReport({ ...request, attachment: null });
    return { reportId: filed.reportId, issueUrl: filed.issueUrl, sanctuaryUrl: reportPageUrl(filed.reportId) };
  } catch (err) {
    return { error: messageOf(err, mainText(msg('main:sanctuary.report.fileFailed'))) };
  }
};

export { submitReport };

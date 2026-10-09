/* @layer electron-main @kind logic */
import type { MainContext } from '@drizztdourden08/brock-electron/main';
import { keepReportSnapshot } from './report-snapshot';
import { submitReport } from './submit-report';

const registerSanctuaryHandlers = ({ handle }: Pick<MainContext, 'handle'>): void => {
  handle('sanctuary:submitReport', (_event, input) => submitReport(input));

  handle('sanctuary:reportSnapshot', (_event, snapshot) => { keepReportSnapshot(snapshot); });
};

export { registerSanctuaryHandlers };

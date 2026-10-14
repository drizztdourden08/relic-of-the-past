/* @layer electron-main @kind logic */
import type { MainContext } from '@drizztdourden08/brock-electron/main';
import { submitReport } from './submit-report';

const registerSanctuaryHandlers = ({ handle }: Pick<MainContext, 'handle'>): void => {
  handle('sanctuary:submitReport', (_event, input) => submitReport(input));
};

export { registerSanctuaryHandlers };

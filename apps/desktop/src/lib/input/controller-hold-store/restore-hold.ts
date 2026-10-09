/* @layer renderer-lib @kind logic */
import { appApi } from '@app/ipc/app-api';
const restoreHold = (): Promise<boolean> => appApi().restoreControllerHold();

export { restoreHold };

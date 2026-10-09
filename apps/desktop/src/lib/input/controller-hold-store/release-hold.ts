/* @layer renderer-lib @kind logic */
import { appApi } from '@app/ipc/app-api';
const releaseHold = (): Promise<boolean> => appApi().releaseControllerHold();

export { releaseHold };

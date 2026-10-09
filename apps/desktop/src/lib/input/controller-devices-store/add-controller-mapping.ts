/* @layer renderer-lib @kind logic */
import { appApi } from '@app/ipc/app-api';
const addControllerMapping = (mapping: string): Promise<boolean> => appApi().addControllerMapping(mapping);

export { addControllerMapping };

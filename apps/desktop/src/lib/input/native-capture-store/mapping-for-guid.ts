/* @layer renderer-lib @kind logic */
import { appApi } from '@app/ipc/app-api';
const mappingForGuid = (guid: string): Promise<string | null> => appApi().mappingForGuid(guid);

export { mappingForGuid };

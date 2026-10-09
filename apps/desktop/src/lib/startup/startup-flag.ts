/* @layer renderer-lib @kind logic */
import { appApi } from '@app/ipc/app-api';

const startupFlag = (name: string): string | true | undefined => appApi()?.startup?.flags?.[name];

export { startupFlag };

/* @layer renderer-app @kind logic */
import { appApi } from '@app/ipc/app-api';
import type { ScreenEditorApi } from '@shared/ipc';
const screenEditor = (): ScreenEditorApi => appApi().screenEditor;

export { screenEditor };

/* @layer renderer-app @kind logic */
import { requireHostApi } from '@drizztdourden08/brock-react';
import type { ScreenEditorApi } from '@app/ipc';
const screenEditor = (): ScreenEditorApi => requireHostApi().screenEditor;

export { screenEditor };

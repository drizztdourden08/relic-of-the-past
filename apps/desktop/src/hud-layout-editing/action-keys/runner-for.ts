/* @layer renderer-components @kind logic */
import type { EditorAction } from '@app/views/HudLayoutEditor/sub-components/SelectionBands';

const runnerFor = (actions: readonly EditorAction[], label: string): EditorAction | undefined =>
  actions.find((action) => action.run !== undefined
    && action.shortcut?.mouse === undefined
    && action.shortcut?.keys?.length === 1
    && action.shortcut.keys[0] === label);

export { runnerFor };

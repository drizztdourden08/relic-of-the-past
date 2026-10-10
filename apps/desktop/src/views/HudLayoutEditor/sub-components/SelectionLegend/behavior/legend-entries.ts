/* @layer renderer-components @kind logic */
import type { EditorAction, EditorShortcut, LegendEntry } from '@app/hud-layout-editing/selection-bands.type';

const legendEntries = (actions: readonly EditorAction[]): LegendEntry[] =>
  actions
    .filter((action): action is EditorAction & { shortcut: EditorShortcut } => action.shortcut !== undefined && action.disabled !== true)
    .map((action) => ({ key: action.key, label: action.label, shortcut: action.shortcut }));

export { legendEntries };

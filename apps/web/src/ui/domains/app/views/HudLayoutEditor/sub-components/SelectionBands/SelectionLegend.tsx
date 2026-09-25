/* @layer renderer-components @kind component */
/**
 * Band 3 is one or two short lines under the lattice, saying what is selected and
 * what can be pressed RIGHT NOW.
 *
 * IT IS DRAWN, NOT SPELLED (§50). §48 printed `⇧click · range` as monospace
 * text, which is read as prose and therefore not read at all; here the keys are
 * `KeyCap`s and the pointer is a `MouseGlyph` with the relevant part lit, so a
 * strip of four entries is scanned, not parsed. The modifier's cap says
 * `⌘` on a Mac and `Ctrl` elsewhere, because its label comes from
 * `primaryModifierLabel(os)`, which is the same answer `isPrimaryModifier` gives the key
 * handler, so the cap cannot promise a key that does not work.
 *
 * EVERY ENTRY IS AN ACTION-TABLE ROW THAT CARRIES A SHORTCUT, so the legend
 * cannot promise a key the table does not run.
 *
 * A REFUSAL IS ANNOUNCED HERE, in the only place in the control that says "no".
 * It is a `role="status"`, so a screen reader hears it without the focus moving.
 *
 * IT IS A FIXED-HEIGHT STRIP (§51). Both lines are single-line and never wrap.
 * The status truncates with its full sentence on its `title` and the caps scroll
 * sideways, so the legend SWAPS its text when the selection changes instead of
 * reflowing and pushing the property band below it up or down.
 */
import { Box } from '@ds/primitives/Box';
import { KeyCap } from '@ds/primitives/KeyCap';
import { MouseGlyph } from '@ds/primitives/MouseGlyph';
import { Text } from '@ds/primitives/Text';
import { primaryModifierLabel } from '@shared/platform';
import './HudLayoutEditor.bands.css';
import type { OsKind } from '@shared/platform';
import type { EditorAction, EditorShortcut } from './selection-bands.type';

interface SelectionLegendProps {
  actions: readonly EditorAction[];
  os: OsKind;
  status: string;
  refusal: string | null;
}

/** `{mod}` is the platform's own word. `⌘` reads as a cap, `Cmd` reads as text,
 *  so the Mac label is the glyph and everything else keeps the word. */
const capLabel = (key: string, os: OsKind): string => {
  if (key !== '{mod}') return key;
  const word = primaryModifierLabel(os);
  return word === 'Cmd' ? '⌘' : word;
};

/** Every shortcut the table declares, as data. A test can then assert the legend
 *  is a PROPERTY of the table, not a second copy of its strings. */
const legendEntries = (actions: readonly EditorAction[]): { key: string; label: string; shortcut: EditorShortcut }[] =>
  actions
    .filter((action): action is EditorAction & { shortcut: EditorShortcut } => action.shortcut !== undefined && action.disabled !== true)
    .map((action) => ({ key: action.key, label: action.label, shortcut: action.shortcut }));

const SelectionLegend = (props: SelectionLegendProps) => {
  const { actions, os, status, refusal } = props;
  return (
    <Box className="hud-grid__legend">
      <Text className="hud-grid__status" role="status" title={refusal ?? status}>{refusal ?? status}</Text>
      <Box className="hud-grid__keys">
        {legendEntries(actions).map((entry) => (
          <Box key={entry.key} className="hud-grid__key" data-shortcut={entry.key}>
            {(entry.shortcut.keys ?? []).map((key) => (
              <KeyCap key={key} label={capLabel(key, os)} />
            ))}
            {entry.shortcut.mouse && <MouseGlyph part={entry.shortcut.mouse} />}
            <Text className="hud-grid__key-text">{entry.label}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export { SelectionLegend, capLabel, legendEntries };
export type { SelectionLegendProps };

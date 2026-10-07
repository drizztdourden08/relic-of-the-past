/* @layer renderer-components @kind component */
/**
 * THE EDITOR'S GLOBAL SETTINGS STRIP sits under the preview, in the centre column,
 * which is where the maintainer put it (§55):
 *
 * > "that setting should be in a global settings at the bottom of the layout
 * > preview (bottom center column)"
 *
 * IT HOLDS ONE SETTING AND IS BUILT TO HOLD THE NEXT. `STEP 1 · 2 · 4 · 8` is
 * how far one press of a `−`/`+` in the inspector moves a number, and 8 is there
 * because the game's own grid is 8px. A gap of 4 and a gap of 8 are the two
 * answers anybody actually types, and stepping to either by ones was the
 * complaint.
 *
 * IT IS THE CENTRE COLUMN'S, NOT THE RAIL'S, AND THAT IS THE ARGUMENT FOR THE
 * PLACE. A setting that changes how EVERY stepped field in the panel behaves
 * cannot live inside one of those fields' own sections without reading as that
 * section's property. The stage column is the editor's own space, holding the ratio,
 * the ground and this, so the strip is under the preview and the sections stay
 * about the document.
 *
 * VIEW-ONLY, NEVER THE DOCUMENT. It takes its value and its setter as props;
 * `HudLayoutEditor`, the View, is what reads `hud-editor-view-store`.
 */
import { Box } from '@ds/primitives/Box';
import { SegmentedControl } from '@ds/primitives/SegmentedControl';
import { EDITOR_STEPS } from '@app/stores/hud-editor-view-store';

const STEP_HINT = 'How far one − or + moves a number in the inspector. 8 is the game\'s own grid.';

interface EditorStepStripProps {
  step: number;
  onStepChange: (next: number) => void;
}

const EditorStepStrip = (props: EditorStepStripProps) => {
  const { step, onStepChange } = props;
  return (
    <Box className="hud-editor__globals" role="group" aria-label="Editor settings" title={STEP_HINT}>
      <SegmentedControl
        size="sm"
        label="step"
        value={String(step)}
        options={EDITOR_STEPS.map((n) => ({ value: String(n), label: String(n) }))}
        onChange={(next) => onStepChange(Number(next))}
      />
    </Box>
  );
};

export { EditorStepStrip, STEP_HINT };
export type { EditorStepStripProps };

/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { SegmentedControl } from '@ds/primitives/SegmentedControl';
import { EDITOR_STEPS } from '@app/stores/hud-editor-view-store';
import { STEP_HINT } from './EditorStepStrip.constants';
import type { EditorStepStripProps } from './EditorStepStrip.type';

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

export { EditorStepStrip };
export type { EditorStepStripProps } from './EditorStepStrip.type';

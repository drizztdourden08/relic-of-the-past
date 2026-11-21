/* @layer renderer-components @kind component */
import { Box, SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { EDITOR_STEPS } from '@app/stores/hud-editor-view-store';
import type { EditorStepStripProps } from './EditorStepStrip.type';
import { useT } from '@drizztdourden08/brock-react';

const EditorStepStrip = (props: EditorStepStripProps) => {
  const t = useT();
  const { step, onStepChange } = props;
  return (
    <Box className="hud-editor__globals" role="group" aria-label={t('hud-editor:editor-step-strip.aria.editor-settings')} title={t('hud-editor:editor-step-strip.hint')}>
      <SegmentedControl
        size="sm"
        className="hud-editor__step"
        label={t('hud-editor:editor-step-strip.label.step')}
        value={String(step)}
        options={EDITOR_STEPS.map((n) => ({ value: String(n), label: String(n) }))}
        onChange={(next) => onStepChange(Number(next))}
      />
    </Box>
  );
};

export { EditorStepStrip };

/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import { EditorStage } from './EditorStage';
import { EditorStepStrip } from './EditorStepStrip';
import type { StageColumnProps } from './StageColumn.type';

const StageColumn = (props: StageColumnProps) => {
  const { editor } = props;
  const { placed, sample, ground, edits } = editor;
  const editorStep = useHudEditorViewStore((s) => s.editorStep);
  const setEditorStep = useHudEditorViewStore((s) => s.setEditorStep);

  return (
    <Box className="hud-editor__stage-column">
      <EditorStage
        placed={placed.all}
        sample={sample}
        ground={ground}
        selectedId={edits.selectedId}
        onSelect={edits.select}
      />
      <Text className="hud-editor__hint">
        {sample.live ? 'Showing sample items. Hearts and counters come from the running save.' : 'Showing sample items and counters.'}
      </Text>
      <EditorStepStrip step={editorStep} onStepChange={setEditorStep} />
    </Box>
  );
};

export { StageColumn };

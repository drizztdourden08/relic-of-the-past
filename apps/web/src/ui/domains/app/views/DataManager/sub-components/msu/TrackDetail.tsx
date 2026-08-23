/* @layer renderer-components @kind component */
/**
 * The block that opens under a slot: shape what the slot's audio does.
 *
 * Deliberately no drop zone. A pack's files are a shared pool that any slot or sound can draw
 * from, so a per-slot target implied a file belonged to the slot it was dropped on — and it put
 * the same control on screen once per expanded row. Adding files is a pack-level action and lives
 * with the pack, once.
 */
import { Box } from '@ds/primitives/Box';
import { LayerEditor } from './LayerEditor';
import type { LayerEditorProps } from './LayerEditor';

interface TrackDetailProps extends LayerEditorProps {
  trackNum: number;
}

const TrackDetail = (props: TrackDetailProps) => {
  const {
    pack, target, manifest, saveBase, availableFiles, isLayered, reportStore, onConfirm, onSaved,
  } = props;

  return (
    <Box className="msu-track-detail">
      <LayerEditor
        key={`${pack}:${target.previewKey}`}
        pack={pack}
        target={target}
        manifest={manifest}
        saveBase={saveBase}
        availableFiles={availableFiles}
        isLayered={isLayered}
        reportStore={reportStore}
        onConfirm={onConfirm}
        onSaved={onSaved}
      />
    </Box>
  );
};

export { TrackDetail };
export type { TrackDetailProps };

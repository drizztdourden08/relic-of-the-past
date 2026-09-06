/* @layer renderer-components @kind component */
// Deliberately no drop zone: files are a pack-level pool, and a per-slot target implied ownership.
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

/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { LayerEditor } from './LayerEditor';
import type { TrackDetailProps } from './TrackDetail.type';

const TrackDetail = (props: TrackDetailProps) => {
  const {
    pack, target, manifest, saveBase, availableFiles, isLayered, reportStore, onConfirm, onSaved, readOnly,
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
        readOnly={readOnly}
      />
    </Box>
  );
};

export { TrackDetail };

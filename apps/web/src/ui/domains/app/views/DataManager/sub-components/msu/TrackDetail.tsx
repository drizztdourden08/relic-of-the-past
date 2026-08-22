/* @layer renderer-components @kind component */
/**
 * The block that opens under a slot: drop audio into it, then shape what that audio does.
 */
import { Box } from '@ds/primitives/Box';
import { DropZone } from '@ds/primitives/DropZone';
import { LayerEditor } from './LayerEditor';
import type { LayerEditorProps } from './LayerEditor';
import { AUDIO_ACCEPT, AUDIO_ACCEPT_HINT } from './msu.constants';

interface TrackDetailProps extends LayerEditorProps {
  trackNum: number;
  uploading: boolean;
  onUpload: (trackNum: number, files: File[]) => void;
}

const TrackDetail = (props: TrackDetailProps) => {
  const {
    pack, trackNum, target, manifest, saveBase, availableFiles, isLayered, reportStore,
    uploading, onUpload, onSaved,
  } = props;

  return (
    <Box className="msu-track-detail">
      <DropZone
        accept={AUDIO_ACCEPT}
        label={uploading ? 'Adding audio…' : `Drop audio for slot ${trackNum}`}
        hint={AUDIO_ACCEPT_HINT}
        disabled={uploading}
        onDrop={(files) => onUpload(trackNum, files)}
      />
      <LayerEditor
        key={`${pack}:${target.previewKey}`}
        pack={pack}
        target={target}
        manifest={manifest}
        saveBase={saveBase}
        availableFiles={availableFiles}
        isLayered={isLayered}
        reportStore={reportStore}
        onSaved={onSaved}
      />
    </Box>
  );
};

export { TrackDetail };
export type { TrackDetailProps };

/* @layer renderer-components @kind component */
/**
 * The block that opens under a sound: drop audio into the pack, then shape what that audio does.
 *
 * The drop zone is not tied to this sound the way a music slot's is — a sound's layers choose
 * from every file in the pack — so what lands here is simply available, and the editor below is
 * where it gets used.
 */
import { Box } from '@ds/primitives/Box';
import { DropZone } from '@ds/primitives/DropZone';
import { Text } from '@ds/primitives/Text';
import { LayerEditor } from './LayerEditor';
import type { LayerEditorProps } from './LayerEditor';
import { AUDIO_ACCEPT, AUDIO_ACCEPT_HINT } from './msu.constants';

interface SoundDetailProps extends LayerEditorProps {
  /** True while nothing claims this sound yet, so the first save is what claims it. */
  unclaimed: boolean;
  uploading: boolean;
  onUpload: (files: File[]) => void;
}

const SoundDetail = (props: SoundDetailProps) => {
  const {
    pack, target, manifest, saveBase, availableFiles, isLayered, reportStore,
    unclaimed, uploading, onUpload, onSaved,
  } = props;

  return (
    <Box className="msu-track-detail">
      {unclaimed && (
        <Text variant="caption">
          This sound still plays from the sound chip. Add a layer with audio and save — that is
          what hands it over to the pack.
        </Text>
      )}
      <DropZone
        accept={AUDIO_ACCEPT}
        label={uploading ? 'Adding audio…' : 'Drop audio into this pack'}
        hint={AUDIO_ACCEPT_HINT}
        disabled={uploading}
        onDrop={onUpload}
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

export { SoundDetail };
export type { SoundDetailProps };

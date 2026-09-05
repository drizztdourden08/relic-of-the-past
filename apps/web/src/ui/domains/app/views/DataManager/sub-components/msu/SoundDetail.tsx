/* @layer renderer-components @kind component */
// The drop zone adds to the pack's pool, not to this sound; the editor below is where a file gets used.
import { Box } from '@ds/primitives/Box';
import { DropZone } from '@ds/primitives/DropZone';
import { Text } from '@ds/primitives/Text';
import { LayerEditor } from './LayerEditor';
import type { LayerEditorProps } from './LayerEditor';
import { SoundGroupField } from './SoundGroupField';
import { AUDIO_ACCEPT, AUDIO_ACCEPT_HINT } from './msu.constants';
import type { SoundChannel } from '@shared/types/msu-manifest';

interface SoundDetailProps extends LayerEditorProps {
  /** Which channel and id this sound is, for the sound-level fields beside the layer editor. */
  channel: SoundChannel;
  soundId: number;
  /** The saved continuity group, or undefined for none. */
  syncGroup: string | undefined;
  /** True while nothing claims this sound yet, so the first save is what claims it. */
  unclaimed: boolean;
  uploading: boolean;
  onUpload: (files: File[]) => void;
}

const SoundDetail = (props: SoundDetailProps) => {
  const {
    pack, target, manifest, saveBase, availableFiles, isLayered, reportStore,
    channel, soundId, syncGroup, unclaimed, uploading, onUpload, onConfirm, onSaved,
  } = props;

  return (
    <Box className="msu-track-detail">
      {unclaimed && (
        <Text variant="caption">
          This sound still plays from the sound chip. Add a layer with audio and save to hand it
          over to the pack.
        </Text>
      )}
      <DropZone
        accept={AUDIO_ACCEPT}
        label={uploading ? 'Adding audio...' : 'Drop audio into this pack'}
        hint={AUDIO_ACCEPT_HINT}
        disabled={uploading}
        onDrop={onUpload}
      />
      {/* Sound-level, so it sits beside the editor. Meaningless until the sound is claimed. */}
      {!unclaimed && (
        <SoundGroupField
          pack={pack}
          channel={channel}
          soundId={soundId}
          group={syncGroup}
          saveBase={saveBase}
          onSaved={onSaved}
        />
      )}
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

export { SoundDetail };
export type { SoundDetailProps };

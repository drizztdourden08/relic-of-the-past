/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { DropZone } from '@ds/primitives/DropZone';
import { Text } from '@ds/primitives/Text';
import { LayerEditor } from './LayerEditor';
import { SoundGroupField } from './SoundGroupField';
import { AUDIO_ACCEPT, AUDIO_ACCEPT_HINT } from './msu.constants';
import type { SoundDetailProps } from './SoundDetail.type';

const SoundDetail = (props: SoundDetailProps) => {
  const {
    pack, target, manifest, saveBase, availableFiles, isLayered, reportStore,
    channel, soundId, syncGroup, unclaimed, uploading, onUpload, onConfirm, onSaved, readOnly = false,
  } = props;

  return (
    <Box className="msu-track-detail">
      {unclaimed && !readOnly && (
        <Text variant="caption">
          This sound still plays from the sound chip. Add a layer with audio and save to hand it
          over to the pack.
        </Text>
      )}
      <DropZone
        accept={AUDIO_ACCEPT}
        label={uploading ? 'Adding audio...' : 'Drop audio into this pack'}
        hint={AUDIO_ACCEPT_HINT}
        disabled={uploading || readOnly}
        onDrop={onUpload}
      />
      {!unclaimed && (
        <SoundGroupField
          pack={pack}
          channel={channel}
          soundId={soundId}
          group={syncGroup}
          saveBase={saveBase}
          disabled={readOnly}
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
        readOnly={readOnly}
      />
    </Box>
  );
};

export { SoundDetail };

/* @layer renderer-components @kind component */
import { DropZone, Text } from '@drizztdourden08/tessera/primitives';
import { StudioSection } from '@app/studio';
import { SoundGroupField } from './SoundGroupField';
import { syncGroupOf } from './behavior/sound-manifest';
import { AUDIO_ACCEPT, AUDIO_ACCEPT_HINT } from './msu.constants';
import type { SoundAudioSectionProps } from './SoundAudioSection.type';

const SoundAudioSection = (props: SoundAudioSectionProps) => {
  const { pack, channel, row, sound, manifest, saveBase, readOnly, onReload } = props;
  const unclaimed = row.layerCount === 0;

  return (
    <StudioSection title="Audio">
      {unclaimed && !readOnly && (
        <Text variant="caption" tone="muted">
          This sound still plays from the sound chip. Add a layer with audio and save to hand it over to the pack.
        </Text>
      )}
      <DropZone
        accept={AUDIO_ACCEPT}
        label={sound.uploading ? 'Adding audio...' : 'Drop audio into this pack'}
        hint={AUDIO_ACCEPT_HINT}
        disabled={sound.uploading || readOnly}
        onDrop={sound.handleUpload}
      />
      {!unclaimed && (
        <SoundGroupField
          pack={pack}
          channel={channel}
          soundId={row.soundId}
          group={syncGroupOf(manifest, channel, row.soundId)}
          saveBase={saveBase}
          disabled={readOnly}
          onSaved={onReload}
        />
      )}
    </StudioSection>
  );
};

export { SoundAudioSection };

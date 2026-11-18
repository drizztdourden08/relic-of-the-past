/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { useT } from '@drizztdourden08/brock-react';
import { UploadField } from '@app/compounds/UploadField';
import { StudioSection } from '@app/studio';
import { SoundGroupField } from './SoundGroupField';
import { syncGroupOf } from './behavior/sound-manifest';
import { AUDIO_ACCEPT } from './msu.constants';
import type { SoundAudioSectionProps } from './SoundAudioSection.type';

const SoundAudioSection = (props: SoundAudioSectionProps) => {
  const { pack, channel, row, sound, manifest, saveBase, readOnly, onReload } = props;
  const t = useT();
  const unclaimed = row.layerCount === 0;

  return (
    <StudioSection title={t('msu-studio:sound.audio.title')}>
      {unclaimed && !readOnly && (
        <Text variant="caption" tone="muted">
          {t('msu-studio:sound.audio.unclaimed')}
        </Text>
      )}
      <UploadField
        variant="block"
        accept={AUDIO_ACCEPT}
        label={sound.uploading ? t('msu-studio:sound.audio.adding') : t('msu-studio:sound.audio.drop')}
        hint={t('msu-studio:files.accept-hint')}
        disabled={sound.uploading || readOnly}
        onFiles={sound.handleUpload}
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

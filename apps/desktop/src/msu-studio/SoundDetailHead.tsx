/* @layer renderer-components @kind component */
import { Button, Flex } from '@drizztdourden08/tessera/primitives';
import { useT } from '@drizztdourden08/brock-react';
import { StudioSection } from '@app/studio';
import { CloseDetailButton } from './CloseDetailButton';
import { PreviewReadout } from './PreviewReadout';
import { SoundBadges } from './SoundBadges';
import { SoundPlayButtons } from './SoundPlayButtons';
import { soundPreviewKey } from './behavior/preview-key';
import { isAdditiveChannel } from './behavior/sound-channel-kind';
import { soundTitle } from './sound-labels';
import type { SoundDetailHeadProps } from './SoundDetailHead.type';

const SoundDetailHead = (props: SoundDetailHeadProps) => {
  const { channel, row, sound, readOnly, onPreview, onPlayOriginal, onStopReplacing, onClose } = props;
  const { soundId, layerCount } = row;
  const t = useT();
  const title = soundTitle(channel, soundId);
  const previewKey = soundPreviewKey(channel, soundId);
  const playing = sound.playing === previewKey;

  return (
    <StudioSection title={title} action={<CloseDetailButton label={t('msu-studio:sound.detail.close', { title })} onClose={() => onClose(channel)} />}>
      <Flex gap="xs" align="center" wrap>
        <SoundBadges row={row} chipAudible={sound.chipAudible(soundId)} />
      </Flex>
      <Flex gap="xs" align="center" wrap>
        <SoundPlayButtons
          row={row}
          channel={channel}
          playing={playing}
          additive={isAdditiveChannel(channel)}
          playingOriginal={sound.playingOriginal === soundId}
          onPreview={onPreview}
          onStopPreview={sound.stop}
          onPlayOriginal={(id) => onPlayOriginal(channel, id)}
        />
        {layerCount > 0 && (
          <Button variant="tertiary" size="sm" disabled={sound.uploading || readOnly} onClick={() => onStopReplacing(channel, soundId)}>
            {t('msu-studio:sound.detail.stop-replacing')}
          </Button>
        )}
      </Flex>
      {playing && <PreviewReadout store={sound.reportStore} previewKey={previewKey} label={title} />}
    </StudioSection>
  );
};

export { SoundDetailHead };

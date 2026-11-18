/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Button, Text } from '@drizztdourden08/tessera/primitives';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { FfmpegInstallStepProps } from './FfmpegInstallStep.type';
import './FfmpegInstallStep.css';

const installLabel = (installing: boolean, error: string | null, t: I18n['t']): string => {
  if (installing) return t('compounds:ffmpeg-install-step.fetching');
  return error === null ? t('compounds:ffmpeg-install-step.get') : t('compounds:ffmpeg-install-step.retry');
};

const FfmpegInstallStep = (props: FfmpegInstallStepProps) => {
  const t = useT();
  const { state, installing, error, onInstall } = props;

  if (state === null) return <Text className="ffmpeg-install-step__note">{t('compounds:ffmpeg-install-step.checking')}</Text>;

  if (state.status === 'unavailable') {
    return (
      <Box className="ffmpeg-install-step">
        <Text className="ffmpeg-install-step__note">{state.hint}</Text>
      </Box>
    );
  }

  return (
    <Box className="ffmpeg-install-step">
      <Text className="ffmpeg-install-step__note">
        {t('compounds:ffmpeg-install-step.this-needs-ffmpeg-which-is')}
      </Text>
      <Text className="ffmpeg-install-step__note ffmpeg-install-step__note--faint">
        {t('compounds:ffmpeg-install-step.download-note')}
      </Text>
      {error !== null && (
        <Text className="ffmpeg-install-step__note ffmpeg-install-step__note--bad">{error}</Text>
      )}
      <Button variant="primary" disabled={installing} onClick={onInstall}>
        {installLabel(installing, error, t)}
      </Button>
    </Box>
  );
};

export { FfmpegInstallStep };

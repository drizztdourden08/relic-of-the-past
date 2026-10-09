/* @layer renderer-components @kind component */
import { Box, Button, Text } from '@drizztdourden08/tessera/primitives';
import type { FfmpegInstallStepProps } from './FfmpegInstallStep.type';
import './FfmpegInstallStep.css';

const installLabel = (installing: boolean, error: string | null): string => {
  if (installing) return 'Fetching...';
  return error === null ? 'Get the tool' : 'Try the download again';
};

const FfmpegInstallStep = (props: FfmpegInstallStepProps) => {
  const { state, installing, error, onInstall } = props;

  if (state === null) return <Text className="ffmpeg-install-step__note">Checking for the tool...</Text>;

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
        This needs ffmpeg, which is not shipped with the app.
      </Text>
      <Text className="ffmpeg-install-step__note ffmpeg-install-step__note--faint">
        A one-time download (around 140 MB) from the FFmpeg-Builds project, checked against its
        published checksum before anything is unpacked. It goes in this install&apos;s own data
        folder and deleting that folder removes it. Nothing outside the app is touched.
      </Text>
      <Text className="ffmpeg-install-step__note ffmpeg-install-step__note--faint">
        LGPL licensed, and run as a separate program, not built in.
      </Text>
      {error !== null && (
        <Text className="ffmpeg-install-step__note ffmpeg-install-step__note--bad">{error}</Text>
      )}
      <Button variant="primary" disabled={installing} onClick={onInstall}>
        {installLabel(installing, error)}
      </Button>
    </Box>
  );
};

export { FfmpegInstallStep };
export type { FfmpegInstallStepProps };

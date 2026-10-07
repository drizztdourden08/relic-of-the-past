/* @layer renderer-components @kind component */
/**
 * Size and destination are stated up front because both are things a user might refuse over.
 * An unserved platform gets no button: unlike a failure, there is nothing to retry. Shared by
 * every ffmpeg-gated feature (MSU audio conversion, debug-report video capture), so a player
 * sees the exact same prompt and the exact same download regardless of which one asked for it.
 */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { ProgressBar } from '@ds/primitives/ProgressBar';
import { Text } from '@ds/primitives/Text';
import { formatBytes } from '@app/utils/formatBytes';
import type { FfmpegInstallStepProps } from './FfmpegInstallStep.type';
import './FfmpegInstallStep.css';

const FfmpegInstallStep = (props: FfmpegInstallStepProps) => {
  const { state, installing, onInstall } = props;

  if (state === null) return <Text className="ffmpeg-install-step__note">Checking for the tool...</Text>;

  if (state.status === 'downloading') {
    return (
      <Box className="ffmpeg-install-step">
        <Text className="ffmpeg-install-step__note">
          Fetching the tool ({formatBytes(state.receivedBytes)} of {formatBytes(state.totalBytes)})
        </Text>
        <ProgressBar value={state.receivedBytes} max={Math.max(1, state.totalBytes)} />
      </Box>
    );
  }

  if (state.status === 'verifying') {
    return (
      <Box className="ffmpeg-install-step">
        <Text className="ffmpeg-install-step__note">Checking the download against its published checksum...</Text>
        <ProgressBar value={100} max={100} variant="green" />
      </Box>
    );
  }

  if (state.status === 'unavailable') {
    return (
      <Box className="ffmpeg-install-step">
        <Text className="ffmpeg-install-step__note">{state.reason}</Text>
        {state.installPackage !== undefined && (
          <Text className="ffmpeg-install-step__note ffmpeg-install-step__note--faint">
            Install the "{state.installPackage}" package, then reopen this dialog.
          </Text>
        )}
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
      {state.status === 'failed' && (
        <Text className="ffmpeg-install-step__note ffmpeg-install-step__note--bad">{state.reason}</Text>
      )}
      <Button variant="primary" disabled={installing} onClick={onInstall}>
        {installing ? 'Fetching...' : state.status === 'failed' ? 'Try the download again' : 'Get the tool'}
      </Button>
    </Box>
  );
};

export { FfmpegInstallStep };
export type { FfmpegInstallStepProps };

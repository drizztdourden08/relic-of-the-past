/* @layer renderer-components @kind component */
/**
 * Size and destination are stated up front because both are things a user might refuse over.
 * An unserved platform gets no button: unlike a failure, there is nothing to retry.
 */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { ProgressBar } from '@ds/primitives/ProgressBar';
import { Text } from '@ds/primitives/Text';
import { PINNED_FFMPEG } from '@shared/types/ffmpeg-tool';
import { formatBytes } from '@app/utils/formatBytes';
import type { InstallStepProps } from './InstallStep.type';

const InstallStep = (props: InstallStepProps) => {
  const { state, installing, onInstall } = props;

  if (state === null) return <Text className="msu-optimize__note">Checking for the audio tool...</Text>;

  if (state.status === 'downloading') {
    return (
      <Box className="msu-optimize__step">
        <Text className="msu-optimize__note">
          Fetching the audio tool ({formatBytes(state.receivedBytes)} of {formatBytes(state.totalBytes)})
        </Text>
        <ProgressBar value={state.receivedBytes} max={Math.max(1, state.totalBytes)} />
      </Box>
    );
  }

  if (state.status === 'verifying') {
    return (
      <Box className="msu-optimize__step">
        <Text className="msu-optimize__note">Checking the download against its published checksum...</Text>
        <ProgressBar value={100} max={100} variant="green" />
      </Box>
    );
  }

  if (state.status === 'unavailable') {
    return (
      <Box className="msu-optimize__step">
        <Text className="msu-optimize__note">{state.reason}</Text>
        {state.installPackage !== undefined && (
          <Text className="msu-optimize__note msu-optimize__note--faint">
            Install the "{state.installPackage}" package, then reopen this dialog.
          </Text>
        )}
      </Box>
    );
  }

  return (
    <Box className="msu-optimize__step">
      <Text className="msu-optimize__note">
        Converting audio needs ffmpeg, which is not shipped with the app.
      </Text>
      <Text className="msu-optimize__note msu-optimize__note--faint">
        A {formatBytes(PINNED_FFMPEG.sizeBytes)} download from the FFmpeg-Builds project, checked
        against its published checksum before anything is unpacked. It goes in this install&apos;s own
        data folder and deleting that folder removes it. Nothing outside the app is touched.
      </Text>
      <Text className="msu-optimize__note msu-optimize__note--faint">
        LGPL licensed, and run as a separate program, not built in.
      </Text>
      {state.status === 'failed' && (
        <Text className="msu-optimize__note msu-optimize__note--bad">{state.reason}</Text>
      )}
      <Button variant="primary" disabled={installing} onClick={onInstall}>
        {installing ? 'Fetching...' : state.status === 'failed' ? 'Try the download again' : 'Get the audio tool'}
      </Button>
    </Box>
  );
};

export { InstallStep };
export type { InstallStepProps };

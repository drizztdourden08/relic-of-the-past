/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import { toolsApi } from '@drizztdourden08/brock-tools/renderer';
import { FFMPEG_TOOL_ID } from '@app/ffmpeg-tool';
import { useDebugCaptureStore } from '@app/stores/debug-capture-store';

const useDebugCapture = (profileId: string) => {
  const isCapturing = useDebugCaptureStore((s) => s.isCapturing);
  const [showFfmpegPrompt, setShowFfmpegPrompt] = useState(false);

  const startRecording = useCallback(() => {
    useDebugCaptureStore.getState().start(profileId);
  }, [profileId]);

  const handleClick = useCallback(async () => {
    if (isCapturing) {
      useDebugCaptureStore.getState().stop();
      return;
    }
    const ffmpeg = await toolsApi()?.state(FFMPEG_TOOL_ID).catch(() => null);
    if (ffmpeg?.status !== 'ready') {
      setShowFfmpegPrompt(true);
      return;
    }
    startRecording();
  }, [isCapturing, startRecording]);

  const resolveFfmpegPrompt = useCallback(() => {
    setShowFfmpegPrompt(false);
    startRecording();
  }, [startRecording]);

  return { isCapturing, handleClick, showFfmpegPrompt, resolveFfmpegPrompt };
};

export { useDebugCapture };

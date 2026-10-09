/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
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
    const ffmpeg = await window.api.getFfmpegState().catch(() => null);
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

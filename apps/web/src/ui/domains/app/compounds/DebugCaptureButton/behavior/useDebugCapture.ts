/* @layer renderer-components @kind hook */
/** Owns the capture button's click behavior: starting a recording checks for ffmpeg first
 *  (now that finalizing encodes a video the moment a recording stops, not at package time)
 *  and asks the caller to show the install prompt if it isn't ready, falling back to raw
 *  frames either way. Stopping never needs ffmpeg - it's just handing the session off. */
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

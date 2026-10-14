/* @layer renderer-hud @kind hook */
import { useRef } from 'react';
import type { DialogFrame } from '@rotp/game-data';
import { useDialogStore } from '../../../stores/dialog-store';
import type { ShownFrame } from '../DialogView.type';
import { useChoiceLatch } from './useChoiceLatch';
import { useFadePresence } from './useFadePresence';

const useShownFrame = (autoSkipDialog: boolean): ShownFrame => {
  const liveFrame = useDialogStore((s) => s.frame);
  const stale = useDialogStore((s) => s.stale);

  const liveWait = useChoiceLatch(liveFrame);
  const waitsOnPlayerChoice = liveWait === 'choice' || liveWait === 'item';
  const show = liveFrame.active && liveFrame.nativeHidden && !stale && (!autoSkipDialog || waitsOnPlayerChoice);
  const fade = useFadePresence(show);

  const lastShownRef = useRef<DialogFrame>(liveFrame);
  if (show) lastShownRef.current = { ...liveFrame, wait: liveWait };
  return { frame: lastShownRef.current, fade };
};

export { useShownFrame };

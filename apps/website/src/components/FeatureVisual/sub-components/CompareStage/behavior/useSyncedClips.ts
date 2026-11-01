/* @layer website-site @kind hook */
import { useEffect, useRef } from 'react';
import { DRIFT_LIMIT_SECONDS } from '../CompareStage.constants';
import { readyClip } from './ready-clip';

const useSyncedClips = (active: boolean, sources: string) => {
  const beforeRef = useRef<HTMLVideoElement | null>(null);
  const afterRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const before = beforeRef.current;
    const after = afterRef.current;
    if (!active || !before || !after) return undefined;
    let visible = false;
    let current = true;

    const playTogether = async (): Promise<void> => {
      before.preload = 'auto';
      after.preload = 'auto';
      await Promise.all([readyClip(before), readyClip(after)]);
      if (!current || !visible) return;
      after.currentTime = before.currentTime;
      await Promise.all([before.play(), after.play()]).catch(() => undefined);
    };

    const restart = (): void => {
      before.currentTime = 0;
      after.currentTime = 0;
      if (visible) Promise.all([before.play(), after.play()]).catch(() => undefined);
    };

    const correct = (): void => {
      if (Math.abs(after.currentTime - before.currentTime) > DRIFT_LIMIT_SECONDS) after.currentTime = before.currentTime;
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (visible) void playTogether();
      else {
        before.pause();
        after.pause();
      }
    });
    observer.observe(before);
    before.addEventListener('ended', restart);
    after.addEventListener('ended', restart);
    before.addEventListener('timeupdate', correct);

    return () => {
      current = false;
      observer.disconnect();
      before.removeEventListener('ended', restart);
      after.removeEventListener('ended', restart);
      before.removeEventListener('timeupdate', correct);
      before.pause();
      after.pause();
    };
  }, [active, sources]);

  return { beforeRef, afterRef };
};

export { useSyncedClips };

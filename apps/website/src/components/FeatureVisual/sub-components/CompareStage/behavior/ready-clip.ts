/* @layer website-site @kind logic */
import { HAVE_FUTURE_DATA } from './ready-clip.constants';

const readyClip = (video: HTMLVideoElement): Promise<void> =>
  new Promise((resolve) => {
    if (video.readyState >= HAVE_FUTURE_DATA) {
      resolve();
      return;
    }
    video.addEventListener('canplay', () => resolve(), { once: true });
  });

export { readyClip };

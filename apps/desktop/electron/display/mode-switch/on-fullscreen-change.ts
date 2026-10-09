/* @layer electron-main @kind logic */
import { applyForFullscreen } from './apply-for-fullscreen';
import { restoreRate } from './restore-rate';

const onFullscreenChange = (isFullscreen: boolean): void => {
  if (isFullscreen) applyForFullscreen();
  else restoreRate();
};

export { onFullscreenChange };

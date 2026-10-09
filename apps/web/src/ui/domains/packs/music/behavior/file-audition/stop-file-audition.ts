/* @layer renderer-components @kind logic */
import { auditionState } from './audition-state';

const stopFileAudition = (): void => {
  if (auditionState.playing === null) return;
  const node = auditionState.playing;
  auditionState.playing = null;
  node.onended = null;
  node.stop();
};

export { stopFileAudition };

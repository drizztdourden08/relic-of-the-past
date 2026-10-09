/* @layer bridge-wasm @kind logic */
import { GESTURE_EVENTS } from './audio-volume.constants';
import { handleResumeGesture } from './handle-resume-gesture';

const disarmGestureResume = (): void => {
  GESTURE_EVENTS.forEach((evt) => window.removeEventListener(evt, handleResumeGesture, true));
};

export { disarmGestureResume };

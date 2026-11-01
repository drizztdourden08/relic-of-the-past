/* @layer website-site @kind logic */
import { REST_ZOOM, ZOOM_MAX, ZOOM_MIN } from '../Lightbox.constants';
import type { ZoomState } from '../Lightbox.type';

const within = (value: number, limit: number): number => Math.min(Math.max(value, -limit), limit);

const clampZoom = (state: ZoomState, width: number, height: number): ZoomState => {
  const scale = Math.min(Math.max(state.scale, ZOOM_MIN), ZOOM_MAX);
  if (scale === ZOOM_MIN) return REST_ZOOM;
  const slackX = ((scale - 1) * width) / 2;
  const slackY = ((scale - 1) * height) / 2;
  return { scale, x: within(state.x, slackX), y: within(state.y, slackY) };
};

export { clampZoom };

/* @layer renderer-other @kind logic */
import { extraViewFor } from '@rotp/game-core';
import { wasmSetExtendedAspect } from '@app/game';
import { liveSettingsNow } from '@app/game/live-settings';
import { GAME_VIEW_RESIZED_EVENT, LIVE_ASPECT_MODES } from './live-aspect.constants';

const gameCanvas = (): HTMLCanvasElement | null => document.querySelector<HTMLCanvasElement>('.game-layer__canvas');

// Recomputes the view size for the window as it is now and hands it to the running core. The core ignores an
// unchanged size, so the event that tells the display to refit goes out only when the canvas buffer moved.
const applyLiveAspect = (): void => {
  const settings = liveSettingsNow();
  if (!settings || !LIVE_ASPECT_MODES.has(settings.aspectRatio)) return;
  const canvas = gameCanvas();
  const before = canvas ? `${canvas.width}x${canvas.height}` : '';
  const { cols, rows } = extraViewFor(settings);
  wasmSetExtendedAspect(cols, rows);
  if (canvas && `${canvas.width}x${canvas.height}` !== before) window.dispatchEvent(new Event(GAME_VIEW_RESIZED_EVENT));
};

export { applyLiveAspect };

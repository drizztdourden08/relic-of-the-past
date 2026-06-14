/* @layer renderer-components @kind logic */
/** Shared helpers for the Home tab: time formatting, game-ready wait, canvas screenshot. */
import { subscribeGameState } from '../../../../../../../lib/game';

const QUICK_SAVE_SLOTS = 12;

const formatRelativeTime = (ts: number | undefined): string => {
  if (!ts) return 'Never';
  const diffMs = Date.now() - ts;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(ts).toLocaleDateString();
};

const defaultSaveName = (): string => {
  return `Save - ${new Date().toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })}`;
};

/** If the game isn't running, start it and resolve once it reaches running/error. */
const ensureGameRunning = async (isGameRunning: boolean, onStartGame: () => void): Promise<void> => {
  if (isGameRunning) return;
  onStartGame();
  await new Promise<void>((resolve) => {
    const unsub = subscribeGameState((state) => {
      if (state.status === 'running' || state.status === 'error') {
        unsub();
        resolve();
      }
    });
  });
};

/** Capture the live game canvas as a PNG ArrayBuffer (DOM concern — stays in the view layer). */
const captureCanvasScreenshot = async (): Promise<ArrayBuffer | undefined> => {
  const canvas = document.querySelector('.game-layer__canvas') as HTMLCanvasElement | null;
  if (!canvas) return undefined;
  try {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
    if (blob) return await blob.arrayBuffer();
  } catch { /* ignore */ }
  return undefined;
};

export { QUICK_SAVE_SLOTS, formatRelativeTime, defaultSaveName, ensureGameRunning, captureCanvasScreenshot };

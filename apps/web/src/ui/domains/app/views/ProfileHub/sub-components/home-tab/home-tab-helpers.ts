/* @layer renderer-components @kind logic */
/** Shared helpers for the Home tab: time formatting, game-ready wait, canvas screenshot. */
import { getGameState, isCoreReady, whenCoreReady, captureGameFrameBlob } from '../../../../../../../lib/game';

const QUICK_SAVE_SLOTS = 12;

/** Ceiling on waiting out a boot — a first run extracts assets before the core starts. */
const BOOT_WAIT_MS = 120_000;

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

/**
 * Resolve once the core can take a command, booting it first if nothing is on its way.
 *
 * `isGameRunning` is the caller's view flag — it says the game view has its asset blob, which
 * happens about two seconds before the core exists. Trusting it was what let a load fire into
 * a null module and be dropped, so the boot went ahead with no state loaded. The bridge's own
 * state decides here; the flag only answers "has a boot already been asked for", so this does
 * not kick off a second one on top of it.
 */
const ensureGameRunning = async (isGameRunning: boolean, onStartGame: () => void): Promise<boolean> => {
  if (isCoreReady()) return true;
  if (!isGameRunning && getGameState().status === 'idle') onStartGame();
  // Long enough to cover a first boot that has to extract assets before the core even starts.
  return whenCoreReady(BOOT_WAIT_MS);
};

/** Capture the currently-rendered game frame as a PNG ArrayBuffer, same path quick-saves use. */
const captureCanvasScreenshot = async (): Promise<ArrayBuffer | undefined> => {
  try {
    const blob = await captureGameFrameBlob();
    if (blob) return await blob.arrayBuffer();
  } catch { /* ignore */ }
  return undefined;
};

export { QUICK_SAVE_SLOTS, formatRelativeTime, defaultSaveName, ensureGameRunning, captureCanvasScreenshot };

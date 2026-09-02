/* @layer renderer-lib @kind logic */
/**
 * The engine's own diagnostic feed — the decisions no live report can show.
 *
 * A channel report says what IS sounding; the core's sound trace says what the game RAISED. The
 * gap between them is what the engine decided in between, and the chance roll is exactly that:
 * a layer that rolled against its odds and lost never starts, so it appears in neither. Without
 * this feed a 10% thunder looks identical to a broken one.
 *
 * Kept outside React and always on: publishing to nobody is a no-op, so the engine posts
 * unconditionally and only a mounted debugger ever hears it.
 */

interface MsuRollEvent {
  kind: 'roll';
  /** The channel the program sounds on — 'music', 'ambient', 'sfx1' or 'sfx2'. */
  channel: string;
  /** The program the layer belongs to: track number or sound id. */
  programId: number;
  layerId: string;
  layerName: string;
  /** The authored odds, 1-100. */
  chance: number;
  passed: boolean;
}

type MsuDebugEvent = MsuRollEvent;
type MsuDebugListener = (event: MsuDebugEvent) => void;

const listeners = new Set<MsuDebugListener>();

const publishMsuDebug = (event: MsuDebugEvent): void => {
  for (const listener of listeners) {
    try { listener(event); } catch { /* a bad listener must never break playback */ }
  }
};

const subscribeMsuDebug = (listener: MsuDebugListener): (() => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

export { publishMsuDebug, subscribeMsuDebug };
export type { MsuDebugEvent, MsuRollEvent };

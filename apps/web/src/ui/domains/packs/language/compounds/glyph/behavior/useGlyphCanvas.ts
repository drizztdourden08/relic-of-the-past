/* @layer renderer-components @kind hook */
/**
 * Keeps one picture character painted, and hands back the canvas to paint into.
 *
 * It repaints after any commit that changes the character or the sheet behind it,
 * and again whenever the display's pixel ratio changes. The ratio matters because
 * the backing store is sized in DEVICE pixels: dragging the window to a monitor
 * at different scaling changes how many real pixels the cell's box is worth
 * without changing the box, so nothing else here would re-render and the character
 * would stay soft until an unrelated edit happened to redraw it.
 *
 * A media query is the only thing that reports that change, and a query only ever
 * matches the ratio it was built with. The ratio is therefore held in state,
 * which both re-arms the query and drives the repaint. Same approach as the game
 * canvas's own fit hook, for the same reason.
 */
import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { measureStore, paintGlyphCell } from '../paint-glyph-cell';

const ratioNow = (): number => window.devicePixelRatio || 1;

type PaintJob = { canvas: HTMLCanvasElement; tiles: Uint8Array; glyph: number; ratio: number };

/*
 * Paints are BATCHED per animation frame: every cell mounted in one commit
 * queues here, then the frame measures all of them before resizing any. A cell
 * that measured and resized itself in its own effect forced a reflow per glyph.
 * A three-row box is sixty reflows, which is what made opening the preview lag.
 */
let pending: PaintJob[] = [];
let frame: number | null = null;

const flushPaints = (): void => {
  frame = null;
  const jobs = pending;
  pending = [];
  const stores = jobs.map((job) => measureStore(job.canvas, job.ratio));
  jobs.forEach((job, at) => {
    const store = stores[at];
    if (store !== null) paintGlyphCell(job.canvas, job.tiles, job.glyph, store);
  });
};

const queuePaint = (job: PaintJob): void => {
  pending.push(job);
  if (frame === null) frame = window.requestAnimationFrame(flushPaints);
};

/**
 * `tiles` is the pack's glyph sheet and `glyph` the character to draw; either
 * being absent leaves the canvas untouched, which shows an empty cell of the
 * right size, not a character that is not the right one.
 */
const useGlyphCanvas = (
  tiles: Uint8Array | null,
  glyph: number | null,
): RefObject<HTMLCanvasElement | null> => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [ratio, setRatio] = useState<number>(ratioNow);

  useEffect(() => {
    const canvas = ref.current;
    if (canvas === null || tiles === null || glyph === null) return;
    queuePaint({ canvas, tiles, glyph, ratio });
  }, [tiles, glyph, ratio]);

  useEffect(() => {
    const query = window.matchMedia(`(resolution: ${ratio}dppx)`);
    const onChange = () => setRatio(ratioNow());
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [ratio]);

  return ref;
};

export { useGlyphCanvas };

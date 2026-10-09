/* @layer renderer-components @kind hook */
import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { measureStore } from '../measure-store';
import { paintGlyphCell } from '../paint-glyph-cell';
import type { PaintJob } from '../glyph.type';

const ratioNow = (): number => window.devicePixelRatio || 1;

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

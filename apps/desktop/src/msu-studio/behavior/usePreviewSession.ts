/* @layer renderer-components @kind hook */
import { useCallback, useRef, useState } from 'react';
import { createMsuEngine } from '@rotp/msu';
import type { MsuEngine } from '@rotp/msu';
import { readMsuTrackFile } from '@app/storage/msu-store';
import { isCurrentSession } from './is-current-session';
import { createPreviewReportStore } from './preview-report-store';
import type { PreviewRun, PreviewSession } from './preview-session.type';

const usePreviewSession = (pack: string | null) => {
  const sessionRef = useRef<PreviewSession | null>(null);
  const frameRef = useRef<number | null>(null);
  const storeRef = useRef(createPreviewReportStore());
  const [error, setError] = useState<string | null>(null);

  const startPolling = useCallback(() => {
    const tick = (): void => {
      const session = sessionRef.current;
      if (!session) {
        frameRef.current = null;
        storeRef.current.publish(null);
        return;
      }
      storeRef.current.publish(session.read(session.engine));
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current ??= requestAnimationFrame(tick);
  }, []);

  const stop = useCallback(() => {
    const session = sessionRef.current;
    sessionRef.current = null;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    storeRef.current.publish(null);
    if (!session) return;
    session.engine.dispose();
    void session.ctx.close();
  }, []);

  const start = useCallback(async (run: PreviewRun): Promise<boolean> => {
    stop();
    if (!pack) return false;
    setError(null);
    const ctx = new AudioContext();
    const engine = createMsuEngine({
      ctx,
      destination: ctx.destination,
      manifest: run.manifest,
      loadBytes: async (fileName) => {
        try { return new Uint8Array(await readMsuTrackFile(pack, fileName)); } catch { return null; }
      },
      isDeluxe: false,
      musicVolume: () => 100,
      onError: setError,
    });
    sessionRef.current = { ctx, engine, read: run.read };
    if (ctx.state === 'suspended') await ctx.resume();
    if (!isCurrentSession(sessionRef, ctx)) return false;
    run.begin(engine);
    startPolling();
    return true;
  }, [pack, stop, startPolling]);

  const retrigger = useCallback((fire: (engine: MsuEngine) => void): boolean => {
    const session = sessionRef.current;
    if (!session) return false;
    fire(session.engine);
    return true;
  }, []);

  return { start, stop, retrigger, error, reportStore: storeRef.current };
};

export { usePreviewSession };
export type { PreviewRun } from './preview-session.type';

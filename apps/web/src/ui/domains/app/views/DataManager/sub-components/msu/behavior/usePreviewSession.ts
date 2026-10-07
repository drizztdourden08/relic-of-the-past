/* @layer renderer-components @kind hook */
/**
 * One AudioContext, one engine, one polling loop. The preview owns its OWN context (the editor
 * works with no game running, and a shared context could outlive the panel); a second audition
 * or leaving the panel tears the pair down. The engine is polled once per animation frame into
 * `preview-report-store`, and the loop ends itself when there is nothing to poll. The caller
 * supplies the manifest, the start call and the reader, so slots and sounds share this.
 */
import { useCallback, useRef, useState } from 'react';
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { createMsuEngine } from '@app/lib/msu/engine';
import type { MsuEngine } from '@app/lib/msu/engine';
import { readMsuTrackFile } from '@app/lib/storage/msu-store';
import { createPreviewReportStore } from './preview-report-store';
import type { PreviewReport } from './preview-report-store';

type ReadReport = (engine: MsuEngine) => PreviewReport | null;

interface PreviewRun {
  /** Only what this audition needs, so nothing else in the pack is decoded. */
  manifest: MsuPackManifest;
  /** Reads the live state of whatever was started, once per animation frame. */
  read: ReadReport;
  /** Starts the audio, once the context is actually running. */
  begin: (engine: MsuEngine) => void;
}

interface PreviewSession {
  ctx: AudioContext;
  engine: MsuEngine;
  read: ReadReport;
}

const usePreviewSession = (pack: string | null) => {
  const sessionRef = useRef<PreviewSession | null>(null);
  const frameRef = useRef<number | null>(null);
  // One store for the hook's whole life, so a subscriber never has to resubscribe.
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
    if (frameRef.current === null) frameRef.current = requestAnimationFrame(tick);
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

  /** True once the audio has actually been started; false when there was nothing to play. */
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
      // The literal slot, never the extended remap: the row the user clicked is the row to hear.
      isDeluxe: false,
      musicVolume: () => 100,
      onError: setError,
    });
    sessionRef.current = { ctx, engine, read: run.read };
    // A suspended context would decode and schedule silently, so wait for it before starting.
    if (ctx.state === 'suspended') await ctx.resume();
    if (sessionRef.current?.ctx !== ctx) return false; // stopped, or superseded, while resuming
    run.begin(engine);
    startPolling();
    return true;
  }, [pack, stop, startPolling]);

  /** Fires again into the running session (additive channels ADD a sound per press). False with no live session. */
  const retrigger = useCallback((fire: (engine: MsuEngine) => void): boolean => {
    const session = sessionRef.current;
    if (!session) return false;
    fire(session.engine);
    return true;
  }, []);

  return { start, stop, retrigger, error, reportStore: storeRef.current };
};

export { usePreviewSession };
export type { PreviewRun };

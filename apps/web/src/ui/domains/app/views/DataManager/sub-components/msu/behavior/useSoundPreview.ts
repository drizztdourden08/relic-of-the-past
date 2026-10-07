/* @layer renderer-components @kind hook */
/**
 * Auditions one claimed sound through `onGameSound`, as the game raises it. On an effects channel
 * a repeat press fires into the RUNNING session: rebuilding would turn overlap into a stutter. The
 * ambient channel is stateful, so there a repeat press replaces the bed, as in the game.
 */
import { useCallback, useEffect, useState } from 'react';
import type { MsuPackManifest, SoundChannel } from '@shared/types/msu-manifest';
import type { MsuEngine } from '@app/lib/msu/engine';
import { usePreviewSession } from './usePreviewSession';
import type { PreviewReport } from './preview-report-store';
import { soundPreviewKey } from './preview-key';
import { channelIndexOf, isAdditiveChannel } from './sound-channel-kind';
import { singleSoundManifest } from './sound-manifest';

/** How many sets are sounding at once, shown only while it is more than the one. */
const overlapNote = (setCount: number, voiceCap: number | null): string | null => {
  if (setCount <= 1) return null;
  return voiceCap === null ? `${setCount} overlapping` : `${setCount} of ${voiceCap} overlapping`;
};

const readChannel = (engine: MsuEngine, channel: SoundChannel): PreviewReport | null => {
  const report = engine.reportChannel(channel);
  if (report === null) return null;
  return {
    key: soundPreviewKey(channel, report.id),
    elapsedSeconds: report.elapsedSeconds,
    layers: report.layers,
    detail: overlapNote(report.setCount, report.voiceCap),
  };
};

const useSoundPreview = (pack: string | null, manifest: MsuPackManifest) => {
  const { start, stop: stopSession, retrigger, error, reportStore } = usePreviewSession(pack);
  // The preview key of the sound this session belongs to, which is what a row compares against.
  const [playing, setPlaying] = useState<string | null>(null);

  const stop = useCallback(() => {
    setPlaying(null);
    stopSession();
  }, [stopSession]);

  const play = useCallback(async (channel: SoundChannel, soundId: number) => {
    const key = soundPreviewKey(channel, soundId);
    const fire = (engine: MsuEngine): void => {
      engine.onGameSound(channelIndexOf(channel), soundId, 0);
    };
    if (playing === key && isAdditiveChannel(channel) && retrigger(fire)) return;
    setPlaying(key);
    const started = await start({
      manifest: singleSoundManifest(manifest, channel, soundId),
      read: (engine) => readChannel(engine, channel),
      begin: fire,
    });
    // Only clear the row this call was for: another sound may already have superseded it.
    if (!started) setPlaying((current) => (current === key ? null : current));
  }, [playing, manifest, start, retrigger]);

  // Leaving the tab, or switching packs, must silence whatever is playing.
  useEffect(() => stop, [pack, stop]);

  return { playing, previewError: error, play, stop, reportStore };
};

export { useSoundPreview };

/* @layer renderer-lib @kind logic */
import type { AudioDiagnostics } from './diagnostics.type';

const msOrUnknown = (seconds: number): number | null => (Number.isFinite(seconds) ? seconds * 1000 : null);

const outputLatencyMsOf = (seconds: number): number | null =>
  (Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : null);

const ignoreCloseFailure = (): void => undefined;

const closeQuietly = async (context: AudioContext | null): Promise<void> => {
  try {
    await context?.close();
  } catch {
    ignoreCloseFailure();
  }
};

const probeAudio = async (): Promise<AudioDiagnostics | null> => {
  let context: AudioContext | null = null;
  try {
    context = new AudioContext();
    const info: AudioDiagnostics = {
      sampleRate: context.sampleRate,
      baseLatencyMs: msOrUnknown(context.baseLatency),
      outputLatencyMs: outputLatencyMsOf(context.outputLatency),
      maxChannels: context.destination.maxChannelCount,
      state: context.state,
    };
    return info;
  } catch {
    return null;
  } finally {
    await closeQuietly(context);
  }
};

export { probeAudio };

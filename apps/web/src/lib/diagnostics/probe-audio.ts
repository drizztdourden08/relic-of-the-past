/* @layer renderer-lib @kind logic */
/**
 * Audio-device probe. The core's mixer runs inside the wasm module, so instead of
 * reaching into it this opens a short-lived context to read the properties the
 * output device imposes on any context. That is the sample rate the resampler has to hit
 * and the buffer latency behind crackle reports.
 */
import type { AudioDiagnostics } from './types';

const probeAudio = async (): Promise<AudioDiagnostics | null> => {
  let context: AudioContext | null = null;
  try {
    context = new AudioContext();
    const outputLatency = context.outputLatency;
    const info: AudioDiagnostics = {
      sampleRate: context.sampleRate,
      baseLatencyMs: Number.isFinite(context.baseLatency) ? context.baseLatency * 1000 : null,
      // Reported as 0 until the graph has actually run; treat that as unknown.
      outputLatencyMs: Number.isFinite(outputLatency) && outputLatency > 0 ? outputLatency * 1000 : null,
      maxChannels: context.destination.maxChannelCount,
      state: context.state,
    };
    return info;
  } catch {
    return null;
  } finally {
    try {
      await context?.close();
    } catch {
      // already closed, or the context never opened
    }
  }
};

export { probeAudio };

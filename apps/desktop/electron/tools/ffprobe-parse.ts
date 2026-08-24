/* @layer electron-main @kind logic */
/**
 * Read ffprobe's JSON report into the fields we keep.
 *
 * ffprobe emits numbers as strings, and reports "N/A" for anything the container did not
 * state, so every value goes through one coercion that yields null rather than NaN. The
 * per-stream figure is preferred over the container's, and the container's is the
 * fallback — a stream that omits its own duration or bit rate is common in VBR files.
 */
import type { ProbedAudio } from '@shared/types/audio-probe';

interface ProbeStream {
  codec_type?: string;
  sample_rate?: string;
  channels?: number;
  bit_rate?: string;
  duration?: string;
}

interface ProbeReport {
  streams?: ProbeStream[];
  format?: { duration?: string; bit_rate?: string };
}

/** Finite number, or null for absent / "N/A" / unparseable. */
const num = (value: string | number | undefined): number | null => {
  if (value === undefined) return null;
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseProbeJson = (raw: string): ProbedAudio | null => {
  let report: ProbeReport;
  try {
    report = JSON.parse(raw) as ProbeReport;
  } catch {
    return null;
  }
  const audio = (report.streams ?? []).find((s) => s.codec_type === 'audio');
  if (!audio) return null;
  return {
    durationSeconds: num(audio.duration) ?? num(report.format?.duration),
    sampleRate: num(audio.sample_rate),
    channels: num(audio.channels),
    bitRate: num(audio.bit_rate) ?? num(report.format?.bit_rate),
  };
};

export { parseProbeJson };

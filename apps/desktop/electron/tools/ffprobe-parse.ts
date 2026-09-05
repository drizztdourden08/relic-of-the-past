/* @layer electron-main @kind logic */
/**
 * Read ffprobe's JSON report into the fields we keep. ffprobe emits numbers as strings
 * and "N/A" for anything unstated, so every value coerces to null, never NaN. The
 * per-stream figure wins, the container's is the fallback (VBR streams often omit theirs).
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

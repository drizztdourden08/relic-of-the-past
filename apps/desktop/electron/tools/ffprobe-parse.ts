/* @layer electron-main @kind logic */
import type { ProbedAudio } from '@rotp/msu';
import type { ProbeReport } from './ffprobe-parse.type';

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

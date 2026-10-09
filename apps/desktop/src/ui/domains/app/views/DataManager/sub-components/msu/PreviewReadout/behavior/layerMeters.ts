/* @layer renderer-components @kind logic */
import type { LayerReport } from '@rotp/msu';
import { clock } from '@domains/packs/music/behavior/clock';
import { voiceCaptions } from './voiceCaptions';
import { shortName } from './shortName';
import { GAP_MODES } from './layerMeters.constants';
import type { FadeMeter, LayerMeterRow, LayerMeters, ReportedVoice } from '../PreviewReadout.type';

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const fadeMeter = (fade: ReportedVoice['fade']): FadeMeter | null => {
  if (fade === null) return null;
  const { kind, remainingSeconds, totalSeconds } = fade;
  return {
    kind,
    fill: totalSeconds > 0 ? clamp01(1 - remainingSeconds / totalSeconds) : 1,
    label: `${kind === 'in' ? 'fade in' : 'fade out'} ${remainingSeconds.toFixed(1)}s`,
  };
};

const loopNote = (loopSeconds: number | null, durationSeconds: number): string =>
  loopSeconds !== null && loopSeconds > 0 && loopSeconds < durationSeconds
    ? ` · repeats from ${clock(loopSeconds)}`
    : '';

const voiceRow = (voice: ReportedVoice, index: number, caption: string, title: string | null): LayerMeterRow => {
  const { positionSeconds, durationSeconds, loopSeconds } = voice;
  const measured = durationSeconds > 0;
  const intro = loopSeconds !== null && loopSeconds > 0 && loopSeconds < durationSeconds;
  return {
    id: `voice-${index}`,
    kind: 'voice',
    caption,
    title,
    fill: measured ? clamp01(positionSeconds / durationSeconds) : null,
    label: measured
      ? `${clock(positionSeconds)} / ${clock(durationSeconds)}${loopNote(loopSeconds, durationSeconds)}`
      : 'playing',
    fade: fadeMeter(voice.fade),
    introFill: measured && intro ? clamp01(loopSeconds / durationSeconds) : null,
  };
};

const silentRow = (report: LayerReport): LayerMeterRow => ({
  id: 'voice-silent',
  kind: 'voice',
  caption: report.fileName === null ? '-' : shortName(report.fileName),
  title: report.fileName,
  fill: null,
  label: report.fileName === null ? 'idle' : 'ended',
  fade: null,
});

const voiceRows = (report: LayerReport, hasGap: boolean): LayerMeterRow[] => {
  const captions = voiceCaptions(report.voices);
  if (report.voices.length > 0) {
    return report.voices.map((voice, index) =>
      voiceRow(voice, index, captions[index].caption, captions[index].title));
  }
  return hasGap ? [] : [silentRow(report)];
};

const nextRow = (report: LayerReport, hasGap: boolean): LayerMeterRow | null => {
  const { nextEventInSeconds, waitSeconds, sounding } = report;
  const row = { id: 'next', kind: 'next' as const, caption: 'next', title: null, fade: null };

  if (!hasGap) return null;
  if (nextEventInSeconds !== null) {
    return {
      ...row,
      fill: waitSeconds !== null && waitSeconds > 0 ? clamp01(1 - nextEventInSeconds / waitSeconds) : null,
      label: `next in ${nextEventInSeconds.toFixed(1)}s`,
    };
  }
  if (sounding) return { ...row, fill: null, label: 'waiting for this sound to finish' };
  return { ...row, fill: null, label: 'idle' };
};

const layerMeters = (report: LayerReport): LayerMeters => {
  const hasGap = GAP_MODES.includes(report.modeKind);
  return { voices: voiceRows(report, hasGap), next: nextRow(report, hasGap) };
};

export { layerMeters };

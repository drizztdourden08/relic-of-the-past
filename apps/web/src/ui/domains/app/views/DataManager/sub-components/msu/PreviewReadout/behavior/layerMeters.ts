/* @layer renderer-components @kind logic */
/**
 * One layer's live report as meter rows: ONE ROW PER AUDIBLE SOUND, oldest first, plus the wait
 * before the next one. A sound can outlast its own gap, so folding them into one bar would hide
 * the overlap worth watching.
 *
 * Rows come from the REPORT, except that only gap modes get a `next` row: a loop has no next event,
 * and a gap mode keeps its row even without a countdown ("waiting for this sound to end" is a
 * state). A countdown fills towards the next sound, with the wait it started from as denominator;
 * a fade fills the same way.
 */
import type { LayerReport } from '@app/lib/msu/engine';
import { clock } from '../../behavior/clock';
import { shortName, voiceCaptions } from './voiceCaptions';
import type { FadeMeter, LayerMeterRow, LayerMeters, ReportedVoice } from '../PreviewReadout.type';

/** The modes that schedule a next event, and so have a gap to count down. */
const GAP_MODES = ['random', 'interval'];

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

// An MSU-1 loop point is usually not the start; saying so keeps the position dropping back from looking broken.
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

// The row a silent layer keeps. Gap modes carry silence in the countdown row, so only continuous modes need this.
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
      // A zero-length gap has no window to fill; the number still reads.
      fill: waitSeconds !== null && waitSeconds > 0 ? clamp01(1 - nextEventInSeconds / waitSeconds) : null,
      label: `next in ${nextEventInSeconds.toFixed(1)}s`,
    };
  }
  // No countdown chosen yet: with wait-for-completion the gap only begins once this sound ends.
  if (sounding) return { ...row, fill: null, label: 'waiting for this sound to finish' };
  return { ...row, fill: null, label: 'idle' };
};

const layerMeters = (report: LayerReport): LayerMeters => {
  const hasGap = GAP_MODES.includes(report.modeKind);
  return { voices: voiceRows(report, hasGap), next: nextRow(report, hasGap) };
};

export { layerMeters };

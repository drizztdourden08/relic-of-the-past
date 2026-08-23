/* @layer renderer-components @kind logic */
/**
 * Turns one layer's live report into the rows a meter draws — how full each bar is, and what the
 * line beside it says.
 *
 * A layer gets ONE ROW PER AUDIBLE SOUND, oldest first, plus a row for the wait before the next
 * one. Those are genuinely unrelated numbers in the modes that fire and fall silent — a sound can
 * outlast its own gap and still be running when the next one lands — so folding them into a single
 * bar would hide exactly the behaviour worth watching. Splitting the sounds themselves out is what
 * makes overlap legible: five random hits layered up read as five named lines, and a crossfade
 * reads as the outgoing pass and the incoming one side by side, each with its own fade.
 *
 * Which rows exist is decided by the REPORT, not by the play mode, except for one thing the report
 * cannot say: whether a gap is part of this mode at all. A loop has no next event to count down,
 * so it is given no `next` row rather than an empty one; a mode that does fire on a gap keeps its
 * row even with no countdown in it, because "waiting for this sound to end" is a state worth
 * naming and an empty bar would read as stuck.
 *
 * A countdown fills as its wait runs down, so the bar is full at the instant of the next sound;
 * the wait it started from is the denominator, which is why a fresh random gap visibly resets the
 * bar to empty and starts over at a different speed. A fade fills the same way, towards the moment
 * it completes.
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

/**
 * An MSU-1 file carries its own loop point, and it is usually NOT the start: the track opens with an
 * intro played once, then repeats everything after it. Saying so is the difference between a reading
 * that makes sense and one that looks broken, because on the repeat the position drops back to the
 * loop point rather than to zero.
 */
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

/**
 * The row a layer keeps when nothing of it is audible. Silence between two shots is the normal
 * state of a gap mode and the countdown row carries it, so only a continuous mode needs this.
 */
const silentRow = (report: LayerReport): LayerMeterRow => ({
  id: 'voice-silent',
  kind: 'voice',
  caption: report.fileName === null ? '—' : shortName(report.fileName),
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

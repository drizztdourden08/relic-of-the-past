/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { LayerReport } from '@rotp/msu';
import { clock } from '@rotp/design/packs';
import { voiceCaptions } from './voice-captions';
import { shortName } from './short-name';
import { GAP_MODES } from './layer-meters.constants';
import type { FadeMeter, LayerMeterRow, LayerMeters, ReportedVoice } from '../PreviewReadout.type';

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const fadeMeter = (t: I18n['t'], fade: ReportedVoice['fade']): FadeMeter | null => {
  if (fade === null) return null;
  const { kind, remainingSeconds, totalSeconds } = fade;
  return {
    kind,
    fill: totalSeconds > 0 ? clamp01(1 - remainingSeconds / totalSeconds) : 1,
    label: t(kind === 'in' ? 'msu-studio:meter.fade-in' : 'msu-studio:meter.fade-out', {
      seconds: remainingSeconds.toFixed(1),
    }),
  };
};

const progressLabel = (t: I18n['t'], voice: ReportedVoice): string => {
  const { positionSeconds, durationSeconds, loopSeconds } = voice;
  const position = clock(positionSeconds);
  const duration = clock(durationSeconds);
  return loopSeconds !== null && loopSeconds > 0 && loopSeconds < durationSeconds
    ? t('msu-studio:meter.progress-loop', { position, duration, loop: clock(loopSeconds) })
    : t('msu-studio:meter.progress', { position, duration });
};

const voiceRow = (
  t: I18n['t'], voice: ReportedVoice, index: number, name: { caption: string; title: string | null },
): LayerMeterRow => {
  const { caption, title } = name;
  const { positionSeconds, durationSeconds, loopSeconds } = voice;
  const measured = durationSeconds > 0;
  const intro = loopSeconds !== null && loopSeconds > 0 && loopSeconds < durationSeconds;
  return {
    id: `voice-${index}`,
    kind: 'voice',
    caption,
    title,
    fill: measured ? clamp01(positionSeconds / durationSeconds) : null,
    label: measured ? progressLabel(t, voice) : t('msu-studio:meter.playing'),
    fade: fadeMeter(t, voice.fade),
    introFill: measured && intro ? clamp01(loopSeconds / durationSeconds) : null,
  };
};

const silentRow = (t: I18n['t'], report: LayerReport): LayerMeterRow => ({
  id: 'voice-silent',
  kind: 'voice',
  caption: report.fileName === null ? '-' : shortName(report.fileName),
  title: report.fileName,
  fill: null,
  label: report.fileName === null ? t('msu-studio:meter.idle') : t('msu-studio:meter.ended'),
  fade: null,
});

const voiceRows = (t: I18n['t'], report: LayerReport, hasGap: boolean): LayerMeterRow[] => {
  const captions = voiceCaptions(t, report.voices);
  if (report.voices.length > 0) {
    return report.voices.map((voice, index) => {
      const label = captions[index];
      if (label === undefined) throw new Error('voiceCaptions returned fewer captions than voices');
      return voiceRow(t, voice, index, label);
    });
  }
  return hasGap ? [] : [silentRow(t, report)];
};

const nextRow = (t: I18n['t'], report: LayerReport, hasGap: boolean): LayerMeterRow | null => {
  const { nextEventInSeconds, waitSeconds, sounding } = report;
  const row = { id: 'next', kind: 'next' as const, caption: t('msu-studio:meter.next'), title: null, fade: null };

  if (!hasGap) return null;
  if (nextEventInSeconds !== null) {
    return {
      ...row,
      fill: waitSeconds !== null && waitSeconds > 0 ? clamp01(1 - nextEventInSeconds / waitSeconds) : null,
      label: t('msu-studio:meter.next-in', { seconds: nextEventInSeconds.toFixed(1) }),
    };
  }
  if (sounding) return { ...row, fill: null, label: t('msu-studio:meter.waiting') };
  return { ...row, fill: null, label: t('msu-studio:meter.idle') };
};

const layerMeters = (t: I18n['t'], report: LayerReport): LayerMeters => {
  const hasGap = GAP_MODES.includes(report.modeKind);
  return { voices: voiceRows(t, report, hasGap), next: nextRow(t, report, hasGap) };
};

export { layerMeters };

/* @layer renderer-widgets @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { LayerReport } from '@rotp/msu';
import { clock } from '@rotp/design/packs';
import { NONE } from '../MusicWidget.constants';
import { GAP_MODES } from './layer-slot.constants';
import type { LayerSlotView } from '../MusicWidget.type';

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const emptySlot = (name: string = NONE, title = ''): LayerSlotView => ({
  empty: true, sounding: false, name, mode: '', fill: 0, label: NONE, flag: '', title,
});

const fadeFlag = (voice: LayerReport['voices'][number]): string =>
  (voice.fade === null ? '' : `${voice.fade.kind} ${voice.fade.remainingSeconds.toFixed(1)}s`);

const flagOf = (report: LayerReport): string => {
  const [first] = report.voices;
  if (first !== undefined && first.fade !== null) return fadeFlag(first);
  return report.voices.length > 1 ? `x${report.voices.length}` : '';
};

const voiceReading = (t: I18n['t'], report: LayerReport): { fill: number; label: string } | null => {
  const [first] = report.voices;
  if (first === undefined) return null;
  if (first.durationSeconds <= 0) return { fill: 0, label: t('views-music:slot.playing') };
  return {
    fill: clamp01(first.positionSeconds / first.durationSeconds),
    label: `${clock(first.positionSeconds)}/${clock(first.durationSeconds)}`,
  };
};

const gapReading = (t: I18n['t'], report: LayerReport): { fill: number; label: string } => {
  const { nextEventInSeconds, waitSeconds, sounding } = report;
  if (nextEventInSeconds !== null) {
    const fill = waitSeconds !== null && waitSeconds > 0 ? clamp01(1 - nextEventInSeconds / waitSeconds) : 0;
    return { fill, label: t('views-music:slot.next', { seconds: nextEventInSeconds.toFixed(1) }) };
  }
  return { fill: 0, label: sounding ? t('views-music:slot.waiting') : t('views-music:slot.idle') };
};

const reading = (t: I18n['t'], report: LayerReport): { fill: number; label: string } => {
  const voice = voiceReading(t, report);
  if (voice !== null) return voice;
  if (GAP_MODES.includes(report.modeKind)) return gapReading(t, report);
  return { fill: 0, label: report.fileName === null ? t('views-music:slot.idle') : t('views-music:slot.ended') };
};

const fileNamesOf = (report: LayerReport): string[] => {
  if (report.voices.length > 0) return report.voices.map((voice) => voice.fileName ?? NONE);
  return report.fileName === null ? [] : [report.fileName];
};

const titleOf = (report: LayerReport): string => [report.layerName, ...fileNamesOf(report)].join(" · ");

const layerSlot = (t: I18n['t'], report: LayerReport): LayerSlotView => ({
  empty: false,
  sounding: report.sounding,
  name: report.layerName,
  mode: report.modeKind,
  ...reading(t, report),
  flag: flagOf(report),
  title: titleOf(report),
});

const overflowSlot = (t: I18n['t'], hidden: number): LayerSlotView => emptySlot(t('views-music:slot.overflow', { count: hidden }));

const layerSlots = (t: I18n['t'], layers: LayerReport[], count: number): LayerSlotView[] => {
  const overflow = layers.length > count;
  const shown = overflow ? layers.slice(0, count - 1) : layers;
  const slots = shown.map((layer) => layerSlot(t, layer));
  if (overflow) slots.push(overflowSlot(t, layers.length - shown.length));
  while (slots.length < count) slots.push(emptySlot());
  return slots;
};

export { layerSlots };

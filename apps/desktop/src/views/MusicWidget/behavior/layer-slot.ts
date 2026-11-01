/* @layer renderer-widgets @kind logic */
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

const voiceReading = (report: LayerReport): { fill: number; label: string } | null => {
  const [first] = report.voices;
  if (first === undefined) return null;
  if (first.durationSeconds <= 0) return { fill: 0, label: 'playing' };
  return {
    fill: clamp01(first.positionSeconds / first.durationSeconds),
    label: `${clock(first.positionSeconds)}/${clock(first.durationSeconds)}`,
  };
};

const gapReading = (report: LayerReport): { fill: number; label: string } => {
  const { nextEventInSeconds, waitSeconds, sounding } = report;
  if (nextEventInSeconds !== null) {
    const fill = waitSeconds !== null && waitSeconds > 0 ? clamp01(1 - nextEventInSeconds / waitSeconds) : 0;
    return { fill, label: `next ${nextEventInSeconds.toFixed(1)}s` };
  }
  return { fill: 0, label: sounding ? 'waiting' : 'idle' };
};

const reading = (report: LayerReport): { fill: number; label: string } => {
  const voice = voiceReading(report);
  if (voice !== null) return voice;
  if (GAP_MODES.includes(report.modeKind)) return gapReading(report);
  return { fill: 0, label: report.fileName === null ? 'idle' : 'ended' };
};

const fileNamesOf = (report: LayerReport): string[] => {
  if (report.voices.length > 0) return report.voices.map((voice) => voice.fileName ?? NONE);
  return report.fileName === null ? [] : [report.fileName];
};

const titleOf = (report: LayerReport): string => [report.layerName, ...fileNamesOf(report)].join(" · ");

const layerSlot = (report: LayerReport): LayerSlotView => ({
  empty: false,
  sounding: report.sounding,
  name: report.layerName,
  mode: report.modeKind,
  ...reading(report),
  flag: flagOf(report),
  title: titleOf(report),
});

const overflowSlot = (hidden: number): LayerSlotView => emptySlot(`+${hidden} more layers`);

const layerSlots = (layers: LayerReport[], count: number): LayerSlotView[] => {
  const overflow = layers.length > count;
  const shown = overflow ? layers.slice(0, count - 1) : layers;
  const slots = shown.map(layerSlot);
  if (overflow) slots.push(overflowSlot(layers.length - shown.length));
  while (slots.length < count) slots.push(emptySlot());
  return slots;
};

export { layerSlots };

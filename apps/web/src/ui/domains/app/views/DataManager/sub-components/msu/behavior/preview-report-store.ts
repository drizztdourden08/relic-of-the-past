/* @layer renderer-components @kind logic */
/**
 * A frame-rate feed of the preview's live state, kept outside React: pushing it through state
 * would re-render the whole slot list sixty times a second. Readouts read it via
 * `useSyncExternalStore`.
 *
 * A frame that would draw the same as the last is not published. The signature rounds every
 * number to the precision it is SHOWN at (the finest thing drawn from it, so a position that also
 * sets a bar's width is tracked to tenths), and walks every voice, since one voice moving is a
 * visible change.
 */
import type { LayerReport } from '@app/lib/msu/engine';

/** One thing being auditioned. The key says WHICH, so a readout can tell "nothing" from "something else". */
interface PreviewReport {
  key: string;
  elapsedSeconds: number;
  layers: LayerReport[];
  /** A short live note beside the clock, like how many effects overlap. Null when there is none. */
  detail: string | null;
}

type ReportedVoice = LayerReport['voices'][number];

type Listener = () => void;

/** The countdown, the elapsed clock, and the position driving the sound bar's width. */
const TENTHS = 0.1;
/** A duration only changes when the file does, so its own precision is never the limit. */
const SECONDS = 1;

const at = (value: number | null, precision: number): string =>
  value === null ? '-' : String(Math.round(value / precision));

/** One row's worth: which file, where it is, and where its fade has got to. */
const voiceSignature = (voice: ReportedVoice): string => [
  voice.fileName ?? '-',
  at(voice.positionSeconds, TENTHS),
  at(voice.durationSeconds, SECONDS),
  voice.fade === null ? '-' : `${voice.fade.kind}${at(voice.fade.remainingSeconds, TENTHS)}`,
].join(',');

const layerSignature = (layer: LayerReport): string => [
  layer.layerId,
  layer.sounding ? '1' : '0',
  // The last file played, which is all a silent layer's row has to show.
  layer.fileName ?? '-',
  at(layer.nextEventInSeconds, TENTHS),
  at(layer.waitSeconds, TENTHS),
  // A voice starting or ending adds or removes a whole row.
  String(layer.voiceCount),
  layer.voices.map(voiceSignature).join('/'),
].join('|');

const signatureOf = (report: PreviewReport | null): string =>
  report === null
    ? ''
    : [
      report.key,
      at(report.elapsedSeconds, TENTHS),
      report.detail ?? '-',
      report.layers.map(layerSignature).join(';'),
    ].join('#');

const createPreviewReportStore = () => {
  const listeners = new Set<Listener>();
  let snapshot: PreviewReport | null = null;
  let signature = signatureOf(null);

  const subscribe = (listener: Listener): (() => void) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  };

  // Stable per publish, so a selector reading one layer out of it stays referentially cacheable.
  const getSnapshot = (): PreviewReport | null => snapshot;

  const publish = (next: PreviewReport | null): void => {
    const nextSignature = signatureOf(next);
    if (nextSignature === signature) return;
    signature = nextSignature;
    snapshot = next;
    listeners.forEach((listener) => listener());
  };

  return { subscribe, getSnapshot, publish };
};

type PreviewReportStore = ReturnType<typeof createPreviewReportStore>;

export { createPreviewReportStore };
export type { PreviewReport, PreviewReportStore };

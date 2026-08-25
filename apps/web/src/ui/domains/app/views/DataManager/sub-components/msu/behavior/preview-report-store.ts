/* @layer renderer-components @kind logic */
/**
 * A frame-rate feed of the preview's live state, kept outside React on purpose.
 *
 * The preview polls the engine once per animation frame, and only the readout should redraw that
 * often — pushing the report through component state would re-render the whole slot list sixty
 * times a second. So the report lives here, in a small observable that the readout leaves read
 * through `useSyncExternalStore`: nothing above them ever hears about a frame.
 *
 * A frame that would draw exactly as the last one did is not published at all. The signature
 * below rounds every number to the precision it is actually SHOWN at, so the publish rate settles
 * around ten a second however fast the loop runs, and the bar's own width transition carries the
 * motion between them.
 *
 * "Shown at" means the finest thing drawn from a number, not the text beside it. A position reads
 * as m:ss but also sets the width of the sound bar, so it is tracked to tenths: rounded to whole
 * seconds the bar would step once a second, and a layer whose only live number is its position —
 * a wait-for-completion one-shot, with no countdown running alongside — would visibly stall
 * between steps.
 *
 * The readout draws a row PER VOICE, so the signature has to walk them: a frame in which only the
 * second of three overlapping sounds moved, or in which one of a crossfade's two halves advanced
 * its fade, is a frame that looks different and must be published. Summarising the voices by their
 * count alone would freeze those rows until something else in the layer happened to change.
 */
import type { LayerReport } from '@app/lib/msu/engine';

/**
 * One thing being auditioned, whatever it is: a music slot, or a sound on one of the three
 * replaceable channels. The key says WHICH, so a readout can tell "nothing is playing" apart
 * from "something else is" without knowing how the other kind is identified.
 */
interface PreviewReport {
  key: string;
  elapsedSeconds: number;
  layers: LayerReport[];
  /** A short live note beside the clock — how many effects are overlapping, or null. */
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

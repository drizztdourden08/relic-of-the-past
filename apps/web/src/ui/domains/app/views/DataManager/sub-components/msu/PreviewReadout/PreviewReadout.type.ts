/* @layer renderer-components @kind types */
import type { LayerReport } from '@app/lib/msu/engine';
import type { PreviewReportStore } from '../behavior/preview-report-store';

/** One sound the engine reports as audible right now — the unit a voice row is drawn from. */
type ReportedVoice = LayerReport['voices'][number];

/**
 * What a row measures: one SOUND that is audible right now, or the WAIT before the next one. A
 * layer can have several sounds going at once, so sound is a row per voice rather than a summary
 * — overlapping random hits and the two halves of a crossfade are then each visible on their own.
 */
type LayerMeterKind = 'voice' | 'next';

/** The fade a voice is in the middle of, drawn at the end of that voice's row. */
interface FadeMeter {
  kind: 'in' | 'out';
  /** 0-1, how far through the fade — 1 is the instant it completes. */
  fill: number;
  label: string;
}

interface LayerMeterRow {
  /** Identifies the row within its layer; voices are numbered oldest first. */
  id: string;
  kind: LayerMeterKind;
  /** The file this row is playing, shortened to fit — never a generic word for a sound. */
  caption: string;
  /** The full file name, so a shortened caption can still be read in full on hover. */
  title: string | null;
  /** 0-1, or null when there is no denominator — the label then stands on its own, with no bar. */
  fill: number | null;
  /** The reading beside the bar — the clock, the countdown, or what little is known. */
  label: string;
  /** Set while this row's sound is crossfading; a countdown row never has one. */
  fade: FadeMeter | null;
  /**
   * 0-1 mark for the intro a looping file plays only once, or null when the whole file repeats.
   * Drawn behind the fill so the region is visible, which is what makes the position jumping
   * backwards on a loop legible as the file's own structure rather than a glitch.
   */
  introFill?: number | null;
}

/**
 * Which rows this layer currently has: one per audible sound, plus the countdown for the modes
 * that wait between sounds. A layer with nothing audible still gets a voice row when its mode is
 * continuous, so its line never collapses to nothing.
 */
interface LayerMeters {
  voices: LayerMeterRow[];
  next: LayerMeterRow | null;
}

interface MeterRowProps {
  row: LayerMeterRow;
}

interface FadeChipProps {
  fade: FadeMeter;
}

interface LayerMeterProps {
  report: LayerReport;
  /** The readout under a slot names each layer; the one inside a layer card already is named. */
  showName?: boolean;
}

interface PreviewReadoutProps {
  store: PreviewReportStore;
  /** What this readout belongs to — a different slot or sound may be the one playing. */
  previewKey: string;
  /** Names it in the heading, e.g. `slot 5` or `Ambient 0x05`. */
  label: string;
}

interface LayerLiveProps {
  store: PreviewReportStore;
  previewKey: string;
  layerId: string;
}

export type {
  ReportedVoice, LayerMeterKind, FadeMeter, LayerMeterRow, LayerMeters,
  MeterRowProps, FadeChipProps, LayerMeterProps, PreviewReadoutProps, LayerLiveProps,
};

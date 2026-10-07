/* @layer renderer-components @kind types */
import type { LayerReport } from '@app/lib/msu/engine';
import type { PreviewReportStore } from '../behavior/preview-report-store';

/** One sound the engine reports as audible right now. A voice row is drawn from one of these. */
type ReportedVoice = LayerReport['voices'][number];

/** One audible SOUND, or the WAIT before the next one. A row per voice, so overlaps are visible. */
type LayerMeterKind = 'voice' | 'next';

/** The fade a voice is in the middle of, drawn at the end of that voice's row. */
interface FadeMeter {
  kind: 'in' | 'out';
  /** 0-1, how far through the fade. It reads 1 the instant the fade completes. */
  fill: number;
  label: string;
}

interface LayerMeterRow {
  /** Identifies the row within its layer; voices are numbered oldest first. */
  id: string;
  kind: LayerMeterKind;
  /** The file this row is playing, shortened to fit. */
  caption: string;
  /** The full file name, so a shortened caption can still be read in full on hover. */
  title: string | null;
  /** 0-1, or null when there is no denominator. The label then stands on its own, with no bar. */
  fill: number | null;
  /** The reading beside the bar, whether a clock, a countdown, or what little is known. */
  label: string;
  /** Set while this row's sound is crossfading; a countdown row never has one. */
  fade: FadeMeter | null;
  /** 0-1 mark for the intro a looping file plays once, or null when the whole file repeats. Drawn behind the fill so the loop jump reads as structure, not a glitch. */
  introFill?: number | null;
}

/** One row per audible sound, plus the countdown for gap modes. A silent continuous layer still gets a voice row. */
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
  /** What this readout belongs to. A different slot or sound may be the one playing. */
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

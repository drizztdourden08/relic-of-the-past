/* @layer renderer-components @kind types */
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import type { LayerTarget } from '../behavior/layer-target';
import type { PreviewReportStore } from '../behavior/preview-report-store';

interface LayerEditorProps {
  pack: string;
  /** Which layer list is being edited — a music slot, or a sound on one of the three channels. */
  target: LayerTarget;
  /** What the editor SHOWS: the pack's manifest with its classic files filled in. */
  manifest: MsuPackManifest;
  /**
   * What the editor WRITES into. For a pack that already has a `pack.json` this is that file
   * as it sits on disk, so saving one slot leaves the rest of the pack out of the manifest and
   * still playing through the classic fallback — otherwise a single edit would freeze all ~100
   * numbered files into authored entries. For a pack with no manifest yet it is the synthesized
   * whole-pack view, which is exactly what the first save is meant to create.
   *
   * A sound's layers are written into the same base for the same reason, and the write itself
   * only rebuilds its own channel — see `sound-manifest`.
   */
  saveBase: MsuPackManifest;
  /** Every audio file in the pack, offered to every layer. */
  availableFiles: string[];
  /** False while the pack has no `pack.json` — the first save is what creates one. */
  isLayered: boolean;
  /**
   * The preview's live feed. Each card is given its own readout element to render, so a saved
   * layer shows what it is doing while it is being edited.
   */
  reportStore: PreviewReportStore;
  onSaved: () => void;
}

export type { LayerEditorProps };

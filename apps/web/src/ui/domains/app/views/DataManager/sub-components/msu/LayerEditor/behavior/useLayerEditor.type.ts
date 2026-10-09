/* @layer renderer-components @kind types */
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import type { LayerTarget } from '../../behavior/layer-target';

interface LayerEditorState {
  pack: string;
  target: LayerTarget;
  manifest: MsuPackManifest;
  saveBase: MsuPackManifest;
  onSaved: () => void;
}

export type { LayerEditorState };

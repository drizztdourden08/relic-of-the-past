/* @layer renderer-components @kind types */
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import type { LayerTarget } from '../behavior/layer-target';
import type { PreviewReportStore } from '../behavior/preview-report-store.type';

type ConfirmRequest = (title: string, message: string, onConfirm: () => void) => void;

interface LayerEditorProps {
  pack: string;
  target: LayerTarget;
  manifest: MsuPackManifest;
  saveBase: MsuPackManifest;
  availableFiles: string[];
  isLayered: boolean;
  reportStore: PreviewReportStore;
  onConfirm: ConfirmRequest;
  onSaved: () => void;
  readOnly?: boolean;
}

export type { LayerEditorProps };
export type { ConfirmRequest };

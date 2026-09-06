/* @layer renderer-components @kind hook */
/**
 * `single` holds one file, so switching into it drops the rest. The question is asked BEFORE the
 * order changes (a refusal leaves everything as it was), and files and mode go out as one patch
 * so a save or revert cannot catch the layer half-changed.
 */
import { useCallback } from 'react';
import type { LayerPlayMode, MsuLayer } from '@shared/types/msu-manifest';
import type { ConfirmRequest } from '../../../LayerEditor.type';
import { SINGLE_DISCARD_TITLE, singleDiscardMessage } from '../LayerCard.constants';

interface ModeChangeParams {
  layer: MsuLayer;
  onConfirm: ConfirmRequest;
  onChange: (patch: Partial<Omit<MsuLayer, 'id'>>) => void;
}

/** The one order that plays a lone file instead of moving between several. */
const isSingle = (mode: LayerPlayMode): boolean => mode.kind === 'loop' && mode.order === 'single';

const useModeChange = (params: ModeChangeParams) => {
  const { layer, onConfirm, onChange } = params;
  const { files, mode: current } = layer;

  const changeMode = useCallback((mode: LayerPlayMode) => {
    // Only the crossing into `single` costs files; already being there, or leaving it, costs none.
    const discards = isSingle(mode) && !isSingle(current) && files.length > 1;
    if (!discards) {
      onChange({ mode });
      return;
    }
    onConfirm(
      SINGLE_DISCARD_TITLE,
      singleDiscardMessage(files),
      () => onChange({ mode, files: files.slice(0, 1) }),
    );
  }, [current, files, onConfirm, onChange]);

  return { changeMode };
};

export { useModeChange };
export type { ModeChangeParams };

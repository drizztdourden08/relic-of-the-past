/* @layer renderer-components @kind hook */
/**
 * Applying a play-mode edit to a layer, guarding the one order that cannot hold what the layer
 * already has: `single` is one track repeating on itself, so a layer holding several files has to
 * give the rest up to take it.
 *
 * The question is asked BEFORE anything moves, and a refusal leaves the order exactly where it
 * was — setting the order first and asking afterwards would leave a layer that says "single" over
 * a list of five files if the answer is no.
 *
 * Files and mode travel out as one patch for the same reason: they are one edit, so a save or a
 * revert cannot catch the layer half-changed.
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

/** The one order that plays a lone file rather than moving between several. */
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

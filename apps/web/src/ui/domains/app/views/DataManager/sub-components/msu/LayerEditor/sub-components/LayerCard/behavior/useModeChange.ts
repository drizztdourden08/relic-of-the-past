/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import type { LayerPlayMode } from '@shared/types/msu-manifest';
import { SINGLE_DISCARD_TITLE } from '../LayerCard.constants';
import { singleDiscardMessage } from './single-discard-message';
import type { ModeChangeParams } from './useModeChange.type';

const isSingle = (mode: LayerPlayMode): boolean => mode.kind === 'loop' && mode.order === 'single';

const useModeChange = (params: ModeChangeParams) => {
  const { layer, onConfirm, onChange } = params;
  const { files, mode: current } = layer;

  const changeMode = useCallback((mode: LayerPlayMode) => {
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

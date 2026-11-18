/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import type { LayerPlayMode } from '@rotp/game-data';
import { singleDiscardMessage } from './single-discard-message';
import type { ModeChangeParams } from './useModeChange.type';

const isSingle = (mode: LayerPlayMode): boolean => mode.kind === 'loop' && mode.order === 'single';

const useModeChange = (params: ModeChangeParams) => {
  const { layer, onConfirm, onChange } = params;
  const { files, mode: current } = layer;
  const t = useT();

  const changeMode = useCallback((mode: LayerPlayMode) => {
    const discards = isSingle(mode) && !isSingle(current) && files.length > 1;
    if (!discards) {
      onChange({ mode });
      return;
    }
    onConfirm(
      t('msu-studio:layers.single.discard-title'),
      singleDiscardMessage(t, files),
      () => onChange({ mode, files: files.slice(0, 1) }),
    );
  }, [t, current, files, onConfirm, onChange]);

  return { changeMode };
};

export { useModeChange };

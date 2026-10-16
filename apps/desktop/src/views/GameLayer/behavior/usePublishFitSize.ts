/* @layer renderer-components @kind hook */
import { useEffect } from 'react';
import { useGameFitStore } from '@app/stores/game-fit-store';
import type { DisplaySize } from '../GameLayer.type';

const usePublishFitSize = (fitSize: DisplaySize): void => {
  const { width, height } = fitSize;

  useEffect(() => {
    useGameFitStore.getState().set(width, height);
  }, [width, height]);
};

export { usePublishFitSize };

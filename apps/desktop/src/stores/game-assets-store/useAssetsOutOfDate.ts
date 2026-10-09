/* @layer renderer-stores @kind hook */
import { useGameAssetsStore } from './useGameAssetsStore';

const useAssetsOutOfDate = (): boolean => useGameAssetsStore(
  (state) => state.bootedGeneration !== null && state.bootedGeneration !== state.bakedGeneration,
);

export { useAssetsOutOfDate };

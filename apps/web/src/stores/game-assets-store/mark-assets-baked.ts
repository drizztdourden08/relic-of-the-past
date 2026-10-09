/* @layer renderer-stores @kind logic */
import { useGameAssetsStore } from './useGameAssetsStore';

const markAssetsBaked = (): void => { useGameAssetsStore.getState().markBaked(); };

export { markAssetsBaked };

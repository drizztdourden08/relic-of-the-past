/* @layer renderer-widgets @kind logic */
import type { ScreenBundleGrid } from '@rotp/game-data';

const cellLabel = (bundle: ScreenBundleGrid, screen: number): string | undefined => {
  const sub = bundle.subNames[screen];
  return sub === undefined || sub === '' ? bundle.screenNames[screen] : sub;
};

export { cellLabel };

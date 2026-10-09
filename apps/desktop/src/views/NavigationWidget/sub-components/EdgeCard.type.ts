/* @layer renderer-widgets @kind types */
import type { ScreenBundleGrid } from '@rotp/game-data';
import type { EdgeRow } from '../../../nav-widget/nav-flood/nav-flood.type';

interface EdgeCardProps {
  row: EdgeRow;
  screenBundle: ScreenBundleGrid | null;
  isIndoors: boolean;
  playerLayer: number | null | undefined;
}

export type { EdgeCardProps };

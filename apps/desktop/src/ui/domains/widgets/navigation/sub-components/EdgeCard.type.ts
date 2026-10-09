/* @layer renderer-widgets @kind types */
import type { ScreenBundle } from '@shared/game/navigation';
import type { EdgeRow } from '../nav-flood/nav-flood.type';

interface EdgeCardProps {
  row: EdgeRow;
  screenBundle: ScreenBundle | null;
  isIndoors: boolean;
  playerLayer: number | null | undefined;
}

export type { EdgeCardProps };

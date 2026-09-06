/* @layer renderer-components @kind types */
import type { ImpactCell } from '@domains/app/compounds/PoolImpactCell';
import type {
  DarkRoomLightField, DarkRoomSetting,
} from '@shared/randomizer/ap-world/dark-rooms/dark-room.type';

interface DarkRoomsSectionProps {
  setting: DarkRoomSetting;
  /** The In Pool cell of the requirement row; omitted where there is no accounting. */
  impact?: ImpactCell;
  /**
   * The lights a sibling setting holds off, each with its reason; shown off
   * and inert with the sentence under the row, the stored answer kept.
   */
  forced?: ReadonlyMap<DarkRoomLightField, string>;
  /** Absent renders the whole section frozen — the run view's read-only face. */
  onChange?: (next: DarkRoomSetting) => void;
}

export type { DarkRoomsSectionProps };

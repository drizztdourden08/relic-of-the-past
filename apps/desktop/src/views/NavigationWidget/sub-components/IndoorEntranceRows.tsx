/* @layer renderer-widgets @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { NO_PALACE } from '../NavigationWidget.constants';
import { hexLabelOf } from '../behavior/hex-label-of';
import { DescRow } from './DescRow';
import type { IndoorEntranceRowsProps } from './GameStatePanel.type';

const IndoorEntranceRows = ({ whichEntrance, palaceIndex, roomStartLayer }: IndoorEntranceRowsProps) => (
  <>
    <DescRow label="Last Entrance" desc="The entrance ID the player last used to enter from the overworld. Determines spawn position, starting layer, and palace assignment. Does NOT update for indoor-to-indoor transitions.">
      <Text className={whichEntrance ? 'nav-val-info' : 'nav-val-muted'}>{whichEntrance ? `${hexLabelOf(whichEntrance, 2)} (${whichEntrance})` : '-'}</Text>
    </DescRow>
    <DescRow label="Palace Index" desc="Identifies which dungeon the player is in (0-13). 0xFF = cave/house (non-dungeon interior). Used for dungeon-specific logic like boss keys and maps.">
      <Text>{palaceIndex === NO_PALACE ? 'Cave/House' : `${palaceIndex >> 1} (0x${palaceIndex.toString(16).toUpperCase()})`}</Text>
    </DescRow>
    <DescRow label="Starting Layer" desc="The layer the player was on when this room was first entered. Captured at room load. In rooms with staircase type 2 (Blocked), the player stays locked to this layer. Layer toggles are caused by door type 22 (kDoorType_PlayerBgChange).">
      {roomStartLayer !== null ? (
        <Text className="nav-val-info">
          {roomStartLayer === 0 ? 'Upper (BG2)' : 'Lower (BG1)'}
        </Text>
      ) : (
        <Text className="nav-val-muted">-</Text>
      )}
    </DescRow>
  </>
);

export { IndoorEntranceRows };

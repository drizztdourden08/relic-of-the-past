/* @layer renderer-widgets @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { NO_PALACE } from '../NavigationWidget.constants';
import { hexLabelOf } from '../behavior/hex-label-of';
import { DescRow } from './DescRow';
import type { IndoorEntranceRowsProps } from './GameStatePanel.type';

const IndoorEntranceRows = ({ whichEntrance, palaceIndex, roomStartLayer }: IndoorEntranceRowsProps) => (
  <>
    <DescRow label="Last Entrance" desc="The entrance the player last used from the overworld. Does not update for indoor-to-indoor transitions.">
      <Text className={whichEntrance ? 'nav-val-info' : 'nav-val-muted'}>{whichEntrance ? `${hexLabelOf(whichEntrance, 2)} (${whichEntrance})` : '-'}</Text>
    </DescRow>
    <DescRow label="Palace Index" desc="Which dungeon the player is in (0-13). 0xFF = cave or house.">
      <Text>{palaceIndex === NO_PALACE ? 'Cave/House' : `${palaceIndex >> 1} (0x${palaceIndex.toString(16).toUpperCase()})`}</Text>
    </DescRow>
    <DescRow label="Starting Layer" desc="The layer the player was on when this room was first entered. In rooms with staircase type 2 (Blocked), the player stays locked to it.">
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

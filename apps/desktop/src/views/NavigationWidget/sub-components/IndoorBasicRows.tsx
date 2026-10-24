/* @layer renderer-widgets @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { NO_PALACE } from '../NavigationWidget.constants';
import { floorRangeLabel } from '../behavior/floor-range-label';
import { hexLabelOf } from '../behavior/hex-label-of';
import { DescRow } from './DescRow';
import type { IndoorBasicRowsProps } from './GameStatePanel.type';

const IndoorBasicRows = ({ palaceIndex, roomIndex, dungeonMapPos }: IndoorBasicRowsProps) => (
  <>
    <DescRow label="Type" desc="The type of interior: Dungeon (palace index 0-13, has maps/keys/bosses), or Cave/House (palace 0xFF, standalone interiors with no dungeon logic).">
      <Text className={palaceIndex === NO_PALACE ? 'nav-val-green' : 'nav-val-info'}>{palaceIndex === NO_PALACE ? 'Cave / House' : 'Dungeon'}</Text>
    </DescRow>
    <DescRow label="Room" desc="The current room ID in the indoor tilemap (0x0000-0x0127). Each indoor room is a 512×512 pixel area.">
      <Text>{hexLabelOf(roomIndex, 4)}</Text>
    </DescRow>
    <DescRow label="Grid Pos" desc="The room's position in the dungeon's 5×5 map grid for the current floor, as 1-based row,col. Caves and houses use the 16×16 room grid.">
      {dungeonMapPos?.found ? (
        <Text className="nav-val-dim">({dungeonMapPos.mapRow + 1}, {dungeonMapPos.mapCol + 1})</Text>
      ) : (
        <Text className="nav-val-muted">({(roomIndex >> 4) + 1}, {(roomIndex & 0xF) + 1})</Text>
      )}
    </DescRow>
    {dungeonMapPos && (
      <DescRow label="Floor" desc="The current dungeon floor, with the range of all floors in this dungeon from highest to lowest.">
        <Text className="nav-val-warning">{dungeonMapPos.floorLabel}</Text>
        <Text className="nav-val-badge">{floorRangeLabel(dungeonMapPos.numAboveFloors, dungeonMapPos.numBasementFloors)}</Text>
      </DescRow>
    )}
  </>
);

export { IndoorBasicRows };

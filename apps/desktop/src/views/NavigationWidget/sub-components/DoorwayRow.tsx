/* @layer renderer-widgets @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { DescRow } from './DescRow';
import type { PlayerRowProps } from './PlayerStatePanel.type';

const DoorwayRow = ({ playerDebug }: PlayerRowProps) => (
  <DescRow label="Doorway" desc="Doorway state, both values LATCHED, not per-frame. Neither is safe to treat as 'is this happening right now'. The first is the orientation of the doorway the player occupies (is_standing_in_doorway): set on entering a room through a doorway, cleared only on certain intra-room transitions. 'Anim' is the door animation step (door_animation_step_indicator, 0-16): it stays at 16 once a door finishes opening instead of returning to 0.">
    <Text className="nav-val-info">
      {playerDebug.inDoorway === 0 ? 'no' : `0x${playerDebug.inDoorway.toString(16).toUpperCase()}`}
      {playerDebug.doorAnimStep > 0 && <Text className="nav-val-warning"> · anim {playerDebug.doorAnimStep}</Text>}
    </Text>
  </DescRow>
);

export { DoorwayRow };

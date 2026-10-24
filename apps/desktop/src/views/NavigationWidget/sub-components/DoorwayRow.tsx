/* @layer renderer-widgets @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { DescRow } from './DescRow';
import type { PlayerRowProps } from './PlayerStatePanel.type';

const DoorwayRow = ({ playerDebug }: PlayerRowProps) => (
  <DescRow label="Doorway" desc="The doorway the player occupies, and the door animation step (0-16). Both are latched, so neither says what is happening right now.">
    <Text className="nav-val-info">
      {playerDebug.inDoorway === 0 ? 'no' : `0x${playerDebug.inDoorway.toString(16).toUpperCase()}`}
      {playerDebug.doorAnimStep > 0 && <Text className="nav-val-warning"> · anim {playerDebug.doorAnimStep}</Text>}
    </Text>
  </DescRow>
);

export { DoorwayRow };

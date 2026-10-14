/* @layer renderer-widgets @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { DescRow } from './DescRow';
import { COLLISION_NAMES } from './PlayerStatePanel.constants';
import type { PlayerRowProps } from './PlayerStatePanel.type';

const CollisionRow = ({ playerDebug }: PlayerRowProps) => {
  const { collisionType } = playerDebug;
  if (collisionType === null || collisionType < 0) return null;

  return (
    <DescRow label="Collision" desc="Room collision type (room_is_dark byte bits). 0=single layer, 1=both layers active, 2=both+scroll, 3=moving floor, 4=water/swim. Determines which BG layers have collision.">
      <Text className="nav-val-info">
        {collisionType} ({COLLISION_NAMES[collisionType] ?? '?'})
      </Text>
    </DescRow>
  );
};

export { CollisionRow };

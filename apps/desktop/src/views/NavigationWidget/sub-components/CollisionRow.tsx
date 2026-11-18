/* @layer renderer-widgets @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { Text } from '@drizztdourden08/tessera/primitives';
import { DescRow } from './DescRow';
import { COLLISION_NAMES } from './PlayerStatePanel.constants';
import type { PlayerRowProps } from './PlayerStatePanel.type';

const CollisionRow = ({ playerDebug }: PlayerRowProps) => {
  const t = useT();
  const text = useText();
  const { collisionType } = playerDebug;
  if (collisionType === null || collisionType < 0) return null;

  return (
    <DescRow id="Collision" label={t('views-navigation:desc.collision.label')} desc={t('views-navigation:desc.collision.text')}>
      <Text className="nav-val-info">
        {collisionType} ({COLLISION_NAMES[collisionType] ? text(COLLISION_NAMES[collisionType]) : '?'})
      </Text>
    </DescRow>
  );
};

export { CollisionRow };

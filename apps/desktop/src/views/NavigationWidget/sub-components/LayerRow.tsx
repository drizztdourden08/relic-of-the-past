/* @layer renderer-widgets @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { DescRow } from './DescRow';
import type { PlayerRowProps } from './PlayerStatePanel.type';

const LayerRow = ({ playerDebug }: PlayerRowProps) => {
  if (playerDebug.playerLayer === null) return null;

  return (
    <DescRow label="Layer" desc="The player's current collision layer (link_is_on_lower_level). 0=Upper/BG2 (drawn behind BG1), 1=Lower/BG1 (drawn in front). Can change via staircases if not blocked.">
      <Text className="nav-val-info">
        {playerDebug.playerLayer === 0 ? '0 (upper/BG2)' : '1 (lower/BG1)'}
      </Text>
    </DescRow>
  );
};

export { LayerRow };

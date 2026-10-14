/* @layer renderer-widgets @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { DescRow } from './DescRow';
import { BLOCKED_STAIRCASE, STAIRCASE_NAMES } from './PlayerStatePanel.constants';
import type { PlayerRowProps } from './PlayerStatePanel.type';

const StaircaseRow = ({ playerDebug }: PlayerRowProps) => {
  const { staircaseType } = playerDebug;
  if (staircaseType === null || staircaseType < 0) return null;

  return (
    <DescRow label="Staircase" desc="Controls layer-change behavior (kind_of_in_room_staircase). 0=intra-room stairs (layer+room shift), 1=layer stairs (changes allowed), 2=pseudo/water stairs (ALL layer changes BLOCKED).">
      <Text className={staircaseType === BLOCKED_STAIRCASE ? 'nav-val-danger' : 'nav-val-pos'}>
        {staircaseType} ({STAIRCASE_NAMES[staircaseType] ?? '?'})
      </Text>
    </DescRow>
  );
};

export { StaircaseRow };

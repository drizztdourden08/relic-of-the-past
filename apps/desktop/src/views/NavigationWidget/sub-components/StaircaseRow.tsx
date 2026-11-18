/* @layer renderer-widgets @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { Text } from '@drizztdourden08/tessera/primitives';
import { DescRow } from './DescRow';
import { BLOCKED_STAIRCASE, STAIRCASE_NAMES } from './PlayerStatePanel.constants';
import type { PlayerRowProps } from './PlayerStatePanel.type';

const StaircaseRow = ({ playerDebug }: PlayerRowProps) => {
  const t = useT();
  const text = useText();
  const { staircaseType } = playerDebug;
  if (staircaseType === null || staircaseType < 0) return null;

  return (
    <DescRow id="Staircase" label={t('views-navigation:desc.staircase.label')} desc={t('views-navigation:desc.staircase.text')}>
      <Text className={staircaseType === BLOCKED_STAIRCASE ? 'nav-val-danger' : 'nav-val-pos'}>
        {staircaseType} ({STAIRCASE_NAMES[staircaseType] ? text(STAIRCASE_NAMES[staircaseType]) : '?'})
      </Text>
    </DescRow>
  );
};

export { StaircaseRow };

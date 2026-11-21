/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Text } from '@drizztdourden08/tessera/primitives';
import { DescRow } from './DescRow';
import type { PlayerRowProps } from './PlayerStatePanel.type';

const DoorwayRow = ({ playerDebug }: PlayerRowProps) => {
  const t = useT();
  return (
    <DescRow id="Doorway" label={t('views-navigation:desc.doorway.label')} desc={t('views-navigation:desc.doorway.text')}>
      <Text className="nav-val-info">
        {playerDebug.inDoorway === 0 ? t('views-navigation:doorway.none') : `0x${playerDebug.inDoorway.toString(16).toUpperCase()}`}
        {playerDebug.doorAnimStep > 0 && <Text className="nav-val-warning"> · {t('views-navigation:doorway.anim', { step: playerDebug.doorAnimStep })}</Text>}
      </Text>
    </DescRow>
  );
};

export { DoorwayRow };

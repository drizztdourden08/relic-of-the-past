/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Text } from '@drizztdourden08/tessera/primitives';
import { NO_PALACE } from '../NavigationWidget.constants';
import { hexLabelOf } from '../behavior/hex-label-of';
import { DescRow } from './DescRow';
import type { IndoorEntranceRowsProps } from './GameStatePanel.type';

const IndoorEntranceRows = ({ whichEntrance, palaceIndex, roomStartLayer }: IndoorEntranceRowsProps) => {
  const t = useT();
  return (
    <>
      <DescRow id="Last Entrance" label={t('views-navigation:desc.lastentrance.label')} desc={t('views-navigation:desc.lastentrance.text')}>
        <Text className={whichEntrance ? 'nav-val-info' : 'nav-val-muted'}>{whichEntrance ? `${hexLabelOf(whichEntrance, 2)} (${whichEntrance})` : '-'}</Text>
      </DescRow>
      <DescRow id="Palace Index" label={t('views-navigation:desc.palaceindex.label')} desc={t('views-navigation:desc.palaceindex.text')}>
        <Text>{palaceIndex === NO_PALACE ? t('views-navigation:palace.cavehouse') : `${palaceIndex >> 1} (0x${palaceIndex.toString(16).toUpperCase()})`}</Text>
      </DescRow>
      <DescRow id="Starting Layer" label={t('views-navigation:desc.startinglayer.label')} desc={t('views-navigation:desc.startinglayer.text')}>
        {roomStartLayer !== null ? (
          <Text className="nav-val-info">
            {roomStartLayer === 0 ? t('views-navigation:startlayer.upper') : t('views-navigation:startlayer.lower')}
          </Text>
        ) : (
          <Text className="nav-val-muted">-</Text>
        )}
      </DescRow>
    </>
  );
};

export { IndoorEntranceRows };

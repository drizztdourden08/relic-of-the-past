/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Text } from '@drizztdourden08/tessera/primitives';
import { NO_PALACE } from '../NavigationWidget.constants';
import { floorRangeLabel } from '../behavior/floor-range-label';
import { hexLabelOf } from '../behavior/hex-label-of';
import { DescRow } from './DescRow';
import type { IndoorBasicRowsProps } from './GameStatePanel.type';

const IndoorBasicRows = ({ palaceIndex, roomIndex, dungeonMapPos }: IndoorBasicRowsProps) => {
  const t = useT();
  return (
    <>
      <DescRow id="Type" label={t('views-navigation:desc.type.label')} desc={t('views-navigation:desc.type.text')}>
        <Text className={palaceIndex === NO_PALACE ? 'nav-val-green' : 'nav-val-info'}>{palaceIndex === NO_PALACE ? t('views-navigation:type.cavehouse') : t('views-navigation:type.dungeon')}</Text>
      </DescRow>
      <DescRow id="Room" label={t('views-navigation:desc.room.label')} desc={t('views-navigation:desc.room.text')}>
        <Text>{hexLabelOf(roomIndex, 4)}</Text>
      </DescRow>
      <DescRow id="Grid Pos" label={t('views-navigation:desc.gridpos.label')} desc={t('views-navigation:desc.gridpos.text')}>
        {dungeonMapPos?.found ? (
          <Text className="nav-val-dim">({dungeonMapPos.mapRow + 1}, {dungeonMapPos.mapCol + 1})</Text>
        ) : (
          <Text className="nav-val-muted">({(roomIndex >> 4) + 1}, {(roomIndex & 0xF) + 1})</Text>
        )}
      </DescRow>
      {dungeonMapPos && (
        <DescRow id="Floor" label={t('views-navigation:desc.floor.label')} desc={t('views-navigation:desc.floor.text')}>
          <Text className="nav-val-warning">{dungeonMapPos.floorLabel}</Text>
          <Text className="nav-val-badge">{floorRangeLabel(t, dungeonMapPos.numAboveFloors, dungeonMapPos.numBasementFloors)}</Text>
        </DescRow>
      )}
    </>
  );
};

export { IndoorBasicRows };

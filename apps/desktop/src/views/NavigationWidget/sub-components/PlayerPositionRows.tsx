/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Text } from '@drizztdourden08/tessera/primitives';
import { DescRow } from './DescRow';
import type { PlayerPositionRowsProps } from './PlayerStatePanel.type';

const PlayerPositionRows = ({ playerDebug, isIndoors, playerX, playerY }: PlayerPositionRowsProps) => {
  const t = useT();
  return (
    <>
      <DescRow id="Player Pos" label={t('views-navigation:desc.playerpos.label')} desc={t('views-navigation:desc.playerpos.text')}>
        <Text className="nav-val-dim">{playerX}, {playerY}</Text>
      </DescRow>
      {!isIndoors && (
        <DescRow id="World Pos" label={t('views-navigation:desc.worldpos.label')} desc={t('views-navigation:desc.worldpos.text')}>
          <Text className="nav-val-pos">({playerDebug.playerX}, {playerDebug.playerY})</Text>
        </DescRow>
      )}
      <DescRow id="Relative" label={t('views-navigation:desc.relative.label')} desc={t('views-navigation:desc.relative.text')}>
        <Text className="nav-val-pos">({playerDebug.relX}, {playerDebug.relY})</Text>
      </DescRow>
      <DescRow id="Sub-tile" label={t('views-navigation:desc.subtile.label')} desc={t('views-navigation:desc.subtile.text')}>
        <Text className="nav-val-pos">r{playerDebug.tileMinRow}-{playerDebug.tileMaxRow} c{playerDebug.tileMinCol}-{playerDebug.tileMaxCol}</Text>
      </DescRow>
      <DescRow id="Map16" label={t('views-navigation:desc.map16.label')} desc={t('views-navigation:desc.map16.text')}>
        <Text className="nav-val-pos">({playerDebug.map16Row}, {playerDebug.map16Col})</Text>
      </DescRow>
      {!isIndoors && (
        <DescRow id="Live Screen" label={t('views-navigation:desc.livescreen.label')} desc={t('views-navigation:desc.livescreen.text')}>
          <Text className="nav-val-pos">0x{playerDebug.liveScreenIndex.toString(16).toUpperCase()}</Text>
        </DescRow>
      )}
    </>
  );
};

export { PlayerPositionRows };

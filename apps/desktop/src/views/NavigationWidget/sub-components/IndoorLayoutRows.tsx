/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Text } from '@drizztdourden08/tessera/primitives';
import { effectiveShapeOf } from '../behavior/effective-shape-of';
import { DescRow } from './DescRow';
import type { IndoorLayoutRowsProps } from './GameStatePanel.type';

const IndoorLayoutRows = ({ roomLayoutInfo, dungeonMapPos }: IndoorLayoutRowsProps) => {
  const t = useT();
  const hasScrollBoundaries = roomLayoutInfo !== null && roomLayoutInfo.intraEdges.length > 0;

  return (
    <>
      {roomLayoutInfo && (
        <DescRow id="Viewport" label={t('views-navigation:desc.viewport.label')} desc={t('views-navigation:desc.viewport.text')}>
          <Text className="nav-val-info">{effectiveShapeOf(roomLayoutInfo)}</Text>
          <Text className={hasScrollBoundaries ? 'nav-game-state-panel__scroll-tag nav-game-state-panel__scroll-tag--scroll' : 'nav-game-state-panel__scroll-tag nav-val-green'}>{hasScrollBoundaries ? t('views-navigation:viewport.scroll') : t('views-navigation:viewport.open')}</Text>
          <Text className="nav-val-badge">raw={roomLayoutInfo.shape} idx={roomLayoutInfo.layout}</Text>
        </DescRow>
      )}
      {dungeonMapPos?.found && (
        <DescRow id="Effective Layout" label={t('views-navigation:desc.effectivelayout.label')} desc={t('views-navigation:desc.effectivelayout.text')}>
          <Text className="nav-val-info">{dungeonMapPos.effectiveLayout}</Text>
        </DescRow>
      )}
    </>
  );
};

export { IndoorLayoutRows };

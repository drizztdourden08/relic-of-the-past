/* @layer renderer-widgets @kind component */
import { useMemo } from 'react';
import { Box, EmptyState, ScrollArea } from '@drizztdourden08/tessera/primitives';
import { buildSchema } from '@drizztdourden08/tessera/data';
import type { CompactFieldRenderer } from '@drizztdourden08/tessera/composites';
import { COLLECTION_SOURCES } from '@app/views/DataInspector/behavior/collection-sources';
import { openInPassOrder, useRecommendations } from '@app/views/DataInspector/behavior/recommendations/use-recommendations';
import { defaultIdRefDisplay } from '@app/views/DataInspector/behavior/record-links';
import { useIdRefNavigation } from '@app/views/DataInspector/behavior/useIdRefNavigation';
import { useDataViewStore } from '@app/stores/data-view-store';
import { useWidgetPref } from '@drizztdourden08/brock-react';
import type { EntityKind, ScreenRecord } from '@rotp/game-data';
import { DEFAULT_KIND, NO_RECORDS_MESSAGE, SPAWNS_PATH } from './LiveDataInspector.constants';
import type { LiveRecord } from './LiveDataInspector.type';
import { useComparison } from './behavior/useComparison';
import { useCurrentRecords } from './behavior/use-current-records';
import { useDetectionPass } from './behavior/useDetectionPass';
import { useLiveContext } from './behavior/useLiveContext';
import { CollectionTabs } from './sub-components/CollectionTabs';
import { RecommendationList } from './sub-components/RecommendationList';
import { RecordCard } from './sub-components/RecordCard';
import { SpawnsSection } from './sub-components/SpawnsSection';
import './LiveDataInspector.css';

const idOf = (record: unknown): string | null => {
  const id = (record as { id?: unknown }).id;
  return typeof id === 'string' ? id : null;
};

const LiveDataInspectorContent = () => {
  const context = useLiveContext();
  useDetectionPass(context);
  const diffsByRecord = useComparison(context);

  const [kind, setKind] = useWidgetPref<EntityKind>('dataset', 'tab', DEFAULT_KIND);
  const allEntries = useRecommendations();
  const screenEntries = useMemo(
    () => openInPassOrder(allEntries.filter(entry => entry.screenId === context.screenId)),
    [allEntries, context.screenId],
  );

  const records = useCurrentRecords(kind, context);
  const source = COLLECTION_SOURCES[kind];
  const schema = useMemo(() => buildSchema(source.rows, source.config), [source]);

  const fieldRenderers = useMemo(() => {
    if (kind !== 'screen') return undefined;
    const renderSpawns: CompactFieldRenderer<LiveRecord> = (record) => {
      const screen = record as ScreenRecord;
      return <SpawnsSection spawns={screen.spawns} diff={diffsByRecord.get(screen.id)?.get(SPAWNS_PATH)} />;
    };
    return new Map([[SPAWNS_PATH, renderSpawns]]);
  }, [kind, diffsByRecord]);

  const openRecord = useDataViewStore((state) => state.openRecord);
  const { handleIdRefClickCapture } = useIdRefNavigation((target) => openRecord(target.kind, target.id));

  return (
    <Box className="live-data-inspector">
      <RecommendationList entries={screenEntries} />
      <CollectionTabs selected={kind} onSelect={setKind} />
      <ScrollArea className="live-data-inspector__record" onClickCapture={handleIdRefClickCapture}>
        {records.length === 0 && <EmptyState message={NO_RECORDS_MESSAGE} />}
        {records.map((record) => {
          const id = idOf(record);
          if (!id) return null;
          return (
            <RecordCard
              key={id}
              kind={kind}
              id={id}
              record={record}
              schema={schema}
              config={source.config}
              resolveIdRefDisplay={defaultIdRefDisplay}
              diffs={diffsByRecord.get(id)}
              fieldRenderers={fieldRenderers}
            />
          );
        })}
      </ScrollArea>
    </Box>
  );
};

export { LiveDataInspectorContent };

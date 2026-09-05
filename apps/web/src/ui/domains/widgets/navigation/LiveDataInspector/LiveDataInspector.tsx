/* @layer renderer-widgets @kind component */
/**
 * "Live Data Inspector" widget (id: `dataset`).
 *
 * Detectors run against the live game (`use-detection-pass.ts`) and surface
 * what they find as cards a reviewer can act on from the widget; only the
 * comparison itself opens in the Data Inspector.
 *
 * A collection tab shows EVERY record this screen relates to, each its own
 * `RecordCard` (see `use-current-records.ts`). Clicking a reference in a card,
 * or its edit button, jumps to the Data Inspector at that record via
 * `openRecord`, the same handoff `openRecommendation` uses for a finding.
 *
 * `useComparison` feeds each card its own record's live differences, keyed by
 * id, so a wrong field shows inline where it lives.
 */
import { useMemo, useState } from 'react';
import { Box, EmptyState, ScrollArea } from '@ds/primitives';
import { buildSchema } from '@ds/data';
import { COLLECTION_SOURCES } from '@app/ui/domains/app/views/DataInspector/behavior/collection-sources';
import { openInPassOrder, useRecommendations } from '@app/ui/domains/app/views/DataInspector/behavior/recommendations/use-recommendations';
import { defaultIdRefDisplay } from '@app/ui/domains/app/views/DataInspector/behavior/record-links';
import { useIdRefNavigation } from '@app/ui/domains/app/views/DataInspector/behavior/useIdRefNavigation';
import { useDataViewStore } from '@app/stores/data-view-store';
import type { EntityKind } from '@shared/game/data';
import { DEFAULT_KIND } from './LiveDataInspector.constants';
import { useComparison } from './behavior/use-comparison';
import { useCurrentRecords } from './behavior/use-current-records';
import { useDetectionPass } from './behavior/use-detection-pass';
import { useLiveContext } from './behavior/use-live-context';
import { CollectionTabs } from './sub-components/CollectionTabs';
import { RecommendationList } from './sub-components/RecommendationList';
import { RecordCard } from './sub-components/RecordCard';
import './LiveDataInspector.css';

const NO_RECORDS = 'No record for this screen in this collection.';

/** Every real collection's rows carry a plain string `id` (see `collection-sources.ts`'s `getId`). */
const idOf = (record: unknown): string | null => {
  const id = (record as { id?: unknown }).id;
  return typeof id === 'string' ? id : null;
};

const LiveDataInspectorContent = () => {
  const context = useLiveContext();
  useDetectionPass(context);
  const diffsByRecord = useComparison(context);

  const [kind, setKind] = useState<EntityKind>(DEFAULT_KIND);
  const allEntries = useRecommendations();
  const screenEntries = useMemo(
    () => openInPassOrder(allEntries.filter(entry => entry.screenId === context.screenId)),
    [allEntries, context.screenId],
  );

  const records = useCurrentRecords(kind, context);
  const source = COLLECTION_SOURCES[kind];
  const schema = useMemo(() => buildSchema(source.rows, source.config), [source]);

  // The same jump `openRecommendation` gives a finding, for a plain record: an
  // edit button below, or a reference clicked inside a card, both land here.
  const openRecord = useDataViewStore((state) => state.openRecord);
  const { handleIdRefClickCapture } = useIdRefNavigation((target) => openRecord(target.kind, target.id));

  return (
    <Box className="live-data-inspector">
      <RecommendationList entries={screenEntries} />
      <CollectionTabs selected={kind} onSelect={setKind} />
      <ScrollArea className="live-data-inspector__record" onClickCapture={handleIdRefClickCapture}>
        {records.length === 0 && <EmptyState message={NO_RECORDS} />}
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
            />
          );
        })}
      </ScrollArea>
    </Box>
  );
};

export { LiveDataInspectorContent };

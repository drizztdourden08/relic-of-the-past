/* @layer renderer-widgets @kind component */
/**
 * LiveDataInspectorContent — "Live Data Inspector" widget (id: `dataset`).
 *
 * Replaces the old Dataset & Mapping widget's status badges and wizard
 * dialogs with the thing this dataset actually needed: detectors that run
 * against the live game (`use-detection-pass.ts`) and surface what they find
 * as cards a reviewer can act on without leaving the widget for anything but
 * the comparison itself, which opens in the Data Inspector.
 *
 * A collection tab shows EVERY record this screen relates to, each its own
 * bordered `RecordCard` (see `use-current-records.ts`) — a screen commonly has
 * several real `connection`/`check` records, not one. Clicking a reference
 * anywhere in a card, or its edit button, jumps to the Data Inspector at that
 * exact record via `openRecord` — the same handoff `openRecommendation`
 * already uses for a finding.
 *
 * `useComparison` (see its own header) feeds each card its own record's live
 * differences, keyed by id, so a wrong field shows inline right where it
 * lives instead of only as a separate recommendation card above.
 *
 * `screen`'s own `spawns` field is dropped from the schema handed to
 * `RecordCard` and rendered as a `SpawnsSection` instead — the generic array
 * cell shows an object element as an unreadable `{...}` (see
 * `array-kit.tsx`'s `summarizeList`), so this one field gets a purpose-built
 * view rather than showing twice or not at all.
 */
import { useMemo, useState } from 'react';
import { Box, EmptyState, ScrollArea } from '@ds/primitives';
import { buildSchema } from '@ds/data';
import type { FieldDescriptor } from '@ds/data';
import { COLLECTION_SOURCES } from '@app/ui/domains/app/views/DataInspector/behavior/collection-sources';
import { openInPassOrder, useRecommendations } from '@app/ui/domains/app/views/DataInspector/behavior/recommendations/use-recommendations';
import { defaultIdRefDisplay } from '@app/ui/domains/app/views/DataInspector/behavior/record-links';
import { useIdRefNavigation } from '@app/ui/domains/app/views/DataInspector/behavior/useIdRefNavigation';
import { useDataViewStore } from '@app/stores/data-view-store';
import type { EntityKind, ScreenRecord } from '@shared/game/data';
import { DEFAULT_KIND } from './LiveDataInspector.constants';
import { useComparison } from './behavior/use-comparison';
import { useCurrentRecords } from './behavior/use-current-records';
import { useDetectionPass } from './behavior/use-detection-pass';
import { useLiveContext } from './behavior/use-live-context';
import { CollectionTabs } from './sub-components/CollectionTabs';
import { RecommendationList } from './sub-components/RecommendationList';
import { RecordCard } from './sub-components/RecordCard';
import { SpawnsSection } from './sub-components/SpawnsSection';
import './LiveDataInspector.css';

const NO_RECORDS = 'No record for this screen in this collection.';

/** Every real collection's rows carry a plain string `id` — see `collection-sources.ts`'s `getId`. */
const idOf = (record: unknown): string | null => {
  const id = (record as { id?: unknown }).id;
  return typeof id === 'string' ? id : null;
};

/** `spawns` gets its own section (see the module header) instead of the generic schema row. */
const schemaFor = (kind: EntityKind, schema: readonly FieldDescriptor[]): readonly FieldDescriptor[] =>
  (kind === 'screen' ? schema.filter((field) => field.path !== 'spawns') : schema);

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
  const displaySchema = useMemo(() => schemaFor(kind, schema), [kind, schema]);

  // The same jump `openRecommendation` already gives a finding, for a plain
  // record instead — an edit button below, or a reference clicked anywhere
  // inside a card, both land here.
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
              schema={displaySchema}
              config={source.config}
              resolveIdRefDisplay={defaultIdRefDisplay}
              diffs={diffsByRecord.get(id)}
            >
              {kind === 'screen' && (
                <SpawnsSection
                  spawns={(record as ScreenRecord).spawns}
                  diff={diffsByRecord.get(id)?.get('spawns')}
                />
              )}
            </RecordCard>
          );
        })}
      </ScrollArea>
    </Box>
  );
};

export { LiveDataInspectorContent };

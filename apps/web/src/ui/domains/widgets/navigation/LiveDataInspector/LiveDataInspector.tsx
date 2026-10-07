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
 *
 * `screen`'s own `spawns` field renders through a `SpawnsSection` supplied as a
 * per-path field renderer. The generic array cell shows an object element as an
 * unreadable `{...}` (see `array-kit.tsx`'s `summarizeList`), so this one field
 * gets a purpose-built view while keeping the place the schema gives it, inside
 * the Contents group alongside the rest of a screen's contents.
 */
import { useMemo } from 'react';
import { Box, EmptyState, ScrollArea } from '@ds/primitives';
import { buildSchema } from '@ds/data';
import type { CompactFieldRenderer } from '@ds/composites/CompactRecordView';
import { COLLECTION_SOURCES } from '@app/ui/domains/app/views/DataInspector/behavior/collection-sources';
import { openInPassOrder, useRecommendations } from '@app/ui/domains/app/views/DataInspector/behavior/recommendations/use-recommendations';
import { defaultIdRefDisplay } from '@app/ui/domains/app/views/DataInspector/behavior/record-links';
import { useIdRefNavigation } from '@app/ui/domains/app/views/DataInspector/behavior/useIdRefNavigation';
import { useDataViewStore } from '@app/stores/data-view-store';
import { useWidgetPref } from '@app/hooks/useWidgetPref';
import type { EntityKind, ScreenRecord } from '@shared/game/data';
import { DEFAULT_KIND } from './LiveDataInspector.constants';
import { useComparison } from './behavior/use-comparison';
import { useCurrentRecords } from './behavior/use-current-records';
import type { LiveRecord } from './behavior/use-current-records';
import { useDetectionPass } from './behavior/use-detection-pass';
import { useLiveContext } from './behavior/use-live-context';
import { CollectionTabs } from './sub-components/CollectionTabs';
import { RecommendationList } from './sub-components/RecommendationList';
import { RecordCard } from './sub-components/RecordCard';
import { SpawnsSection } from './sub-components/SpawnsSection';
import './LiveDataInspector.css';

const NO_RECORDS = 'No record for this screen in this collection.';
const SPAWNS_PATH = 'spawns';

/** Every real collection's rows carry a plain string `id` (see `collection-sources.ts`'s `getId`). */
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

  // `spawns` keeps its schema position and swaps only its cell (see the module
  // header); every other field, and every other collection, renders as usual.
  const fieldRenderers = useMemo(() => {
    if (kind !== 'screen') return undefined;
    const renderSpawns: CompactFieldRenderer<LiveRecord> = (record) => {
      const screen = record as ScreenRecord;
      return <SpawnsSection spawns={screen.spawns} diff={diffsByRecord.get(screen.id)?.get(SPAWNS_PATH)} />;
    };
    return new Map([[SPAWNS_PATH, renderSpawns]]);
  }, [kind, diffsByRecord]);

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
              fieldRenderers={fieldRenderers}
            />
          );
        })}
      </ScrollArea>
    </Box>
  );
};

export { LiveDataInspectorContent };

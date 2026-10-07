/* @layer renderer-widgets @kind component */
/**
 * One record in its own bordered container: a collection tab can hold more
 * than one record for the current screen (several connections, several
 * checks), so each gets its own card instead of the widget picking one.
 *
 * The border/background match `RecommendationCard`. The edit button is
 * `IconButton`, the same primitive `RecordEditor`'s array rows use, with a
 * `title` alongside its `label` for a hover tooltip. `ReviewControls` sits
 * here too, one per record: reviewing "this screen's data" always meant
 * reviewing one of several real records, never the collection as a whole.
 */
import { Box, Flex, IconButton } from '@ds/primitives';
import { CompactRecordView } from '@ds/composites/CompactRecordView';
import { useDataViewStore } from '@app/stores/data-view-store';
import { ReviewControls } from './ReviewControls';
import type { CompactRecordViewProps } from '@ds/composites/CompactRecordView';
import type { EntityKind } from '@shared/game/data';
import './RecordCard.css';

const EDIT_LABEL = 'Edit';

interface RecordCardProps<T> {
  kind: EntityKind;
  id: string;
  record: T;
  schema: CompactRecordViewProps<T>['schema'];
  config?: CompactRecordViewProps<T>['config'];
  resolveIdRefDisplay?: CompactRecordViewProps<T>['resolveIdRefDisplay'];
  /** This record's own live differences, looked up by id before this prop arrives. */
  diffs?: CompactRecordViewProps<T>['diffs'];
}

const RecordCard = <T,>(props: RecordCardProps<T>) => {
  const { kind, id, record, schema, config, resolveIdRefDisplay, diffs } = props;
  const openRecord = useDataViewStore((state) => state.openRecord);

  return (
    <Box className="live-record-card">
      <Flex justify="end" className="live-record-card__actions">
        <IconButton label={EDIT_LABEL} title={EDIT_LABEL} onClick={() => openRecord(kind, id)}>
          ✏️
        </IconButton>
      </Flex>
      <CompactRecordView
        record={record}
        schema={schema}
        config={config}
        resolveIdRefDisplay={resolveIdRefDisplay}
        diffs={diffs}
      />
      <ReviewControls kind={kind} recordId={id} />
    </Box>
  );
};

export { RecordCard };
export type { RecordCardProps };

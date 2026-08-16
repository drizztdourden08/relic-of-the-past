/* @layer renderer-widgets @kind component */
/**
 * One record, its own bordered container — the multi-entry shape a
 * collection tab needs once it can hold more than one record for the current
 * screen (several connections, several checks): each gets its own card rather
 * than the widget picking just one and discarding the rest.
 *
 * The border/background match `RecommendationCard`'s own look, this widget's
 * existing card convention. The edit button is `IconButton`, the same
 * bare-icon-button primitive `RecordEditor`'s array rows already use, with a
 * `title` alongside its `label` for an immediate hover tooltip on top of the
 * screen-reader text. `ReviewControls` moves in here too, one per record
 * rather than one for whichever record used to be picked — reviewing "this
 * screen's data" always meant reviewing one of several real records, never
 * the collection as a whole.
 *
 * `fieldRenderers` passes straight through to the compact view: a kind-specific
 * section (e.g. a screen's `SpawnsSection`) reaches its field's own place in the
 * schema that way, so this card stays generic over every collection rather than
 * carrying a slot that knows any one kind's extra content.
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
  /** Per-path field views for this kind, shown in each field's own schema position. */
  fieldRenderers?: CompactRecordViewProps<T>['fieldRenderers'];
}

const RecordCard = <T,>(props: RecordCardProps<T>) => {
  const { kind, id, record, schema, config, resolveIdRefDisplay, diffs, fieldRenderers } = props;
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
        fieldRenderers={fieldRenderers}
      />
      <ReviewControls kind={kind} recordId={id} />
    </Box>
  );
};

export { RecordCard };
export type { RecordCardProps };

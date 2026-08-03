/* @layer renderer-app @kind component */
/**
 * The editor tab. `RecordEditor` already renders read-only when it is handed no
 * save function, so the only thing added here is a note saying why — a form
 * that quietly refuses to save looks broken, and a save button that cannot
 * write would be worse.
 *
 * This is also where the lookups are injected — the collections behind the ids
 * it edits, the vocabulary behind its tags, how a term that does not exist yet
 * gets filed, the real limits on its numbers, and — for the two kinds other
 * records can point at — what still references this one and how to delete it
 * safely. Each resolver is bound to the collection once and reused, so the
 * form's binding is not rebuilt on every render.
 */
import { Box, Text } from '@ds/primitives';
import { DeleteGuardDialog, RecordEditor } from '@ds/composites';
import { resolveIdRefOptionsFor } from '../behavior/id-ref-options';
import { tagSuggestionsResolverFor } from '../behavior/tag-suggestions';
import { tagCreatorFor } from '../behavior/create-tag';
import { numberBoundsResolverFor } from '../behavior/number-bounds';
import { resolveRecordLabel } from '../behavior/record-links';
import { useDeleteGuard } from '../behavior/useDeleteGuard';
import type { FieldDescriptor } from '@ds/data';
import type { InspectorRow, InspectorSource } from '../DataInspector.type';

const READ_ONLY_NOTE = 'No write path is wired for this collection yet — this form reads the record, it cannot save it.';

interface RecordEditorPanelProps {
  source: InspectorSource;
  schema: readonly FieldDescriptor[];
  record: InspectorRow;
  /** The record open here was just deleted — nothing is left to show. */
  onDeleted: () => void;
}

const RecordEditorPanel = (props: RecordEditorPanelProps) => {
  const { source, schema, record, onDeleted } = props;
  const id = source.getId(record);
  const {
    onDelete, referencedBy, dialogOpen, dialogHits, dialogError, confirmDelete, cancelDelete,
  } = useDeleteGuard(source.id, id, onDeleted);

  return (
    <Box className="data-inspector__editor">
      {source.onSave === undefined && (
        <Text as="p" className="data-inspector__note">{READ_ONLY_NOTE}</Text>
      )}
      <RecordEditor
        record={record}
        schema={schema}
        config={source.config}
        onSave={source.onSave}
        resolveIdRefOptions={resolveIdRefOptionsFor}
        resolveTagSuggestions={tagSuggestionsResolverFor(source.id)}
        onCreateTag={tagCreatorFor(source.id)}
        resolveNumberBounds={numberBoundsResolverFor(source.id)}
        referencedBy={referencedBy}
        onDelete={onDelete}
      />
      <DeleteGuardDialog
        open={dialogOpen}
        subjectLabel={resolveRecordLabel(id)}
        hits={dialogHits}
        error={dialogError}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </Box>
  );
};

export { RecordEditorPanel };
export type { RecordEditorPanelProps };

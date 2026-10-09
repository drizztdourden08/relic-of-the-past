/* @layer renderer-app @kind component */
import { Box, Text } from '@ds/primitives';
import { DeleteGuardDialog, RecordEditor } from '@ds/composites';
import { READ_ONLY_NOTE } from '../DataInspector.constants';
import type { RecordEditorPanelProps } from '../DataInspector.type';
import { resolveIdRefOptionsFor } from '../behavior/id-ref-options';
import { numberBoundsResolverFor } from '../behavior/number-bounds';
import { resolveRecordLabel } from '../behavior/record-links';
import { tagCreatorFor } from '../behavior/tag-creator-for';
import { tagSuggestionsResolverFor } from '../behavior/tag-suggestions';
import { useDeleteGuard } from '../behavior/useDeleteGuard';

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

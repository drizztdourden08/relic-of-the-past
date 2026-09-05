/* @layer renderer-app @kind component */
/**
 * The "New record" trigger and its dialog together, so a collection with no
 * create write path renders neither. Wires the same resolvers as
 * `RecordEditorPanel`, so fields behave the same when creating and editing.
 */
import { Button } from '@ds/primitives';
import { CreateRecordDialog } from '@ds/composites';
import { resolveIdRefOptionsFor } from '../behavior/id-ref-options';
import { tagSuggestionsResolverFor } from '../behavior/tag-suggestions';
import { tagCreatorFor } from '../behavior/create-tag';
import { numberBoundsResolverFor } from '../behavior/number-bounds';
import { useCreateRecordDialog } from '../behavior/useCreateRecordDialog';
import type { EntityKind } from '@shared/game/data';
import type { FieldDescriptor } from '@ds/data';

interface CreateRecordButtonProps {
  kind: EntityKind;
  /** The nav rail's plural label for this collection, e.g. "Item Groups". */
  label: string;
  schema: readonly FieldDescriptor[];
  onCreated: (id: string) => void;
}

/** Every current label is a plain plural, so trimming the trailing `s` reads naturally. */
const singular = (label: string): string => label.replace(/s$/, '');

const CreateRecordButton = (props: CreateRecordButtonProps) => {
  const { kind, label, schema, onCreated } = props;
  const {
    open, openDialog, cancelDialog, handleCreated,
    createSchema, initialRecord, requiredPaths, onCreate,
  } = useCreateRecordDialog(kind, schema, onCreated);

  if (!onCreate) return null;

  return (
    <>
      <Button variant="secondary" size="sm" onClick={openDialog}>{`+ New ${singular(label)}`}</Button>
      <CreateRecordDialog
        open={open}
        title={`New ${singular(label)}`}
        schema={createSchema}
        initialRecord={initialRecord}
        requiredPaths={requiredPaths}
        resolveIdRefOptions={resolveIdRefOptionsFor}
        resolveTagSuggestions={tagSuggestionsResolverFor(kind)}
        onCreateTag={tagCreatorFor(kind)}
        resolveNumberBounds={numberBoundsResolverFor(kind)}
        onCreate={onCreate}
        onCreated={handleCreated}
        onCancel={cancelDialog}
      />
    </>
  );
};

export { CreateRecordButton };

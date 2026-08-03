/* @layer renderer-app @kind component */
/**
 * The "New record" action for one collection — the trigger and the dialog it
 * opens, together, so a collection with no create write path (`onCreate`
 * undefined) renders neither rather than a button that cannot do anything.
 *
 * Wires the same injected resolvers `RecordEditorPanel` gives an existing
 * record's editor, so a picker, a tag entry or a bounded number behaves
 * identically whether the record already exists or is being created right now.
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

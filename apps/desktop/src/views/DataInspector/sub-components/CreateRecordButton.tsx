/* @layer renderer-app @kind component */
import { Button } from '@drizztdourden08/tessera/primitives';
import { CreateRecordDialog } from '@drizztdourden08/tessera/composites';
import type { CreateRecordButtonProps } from '../DataInspector.type';
import { resolveIdRefOptionsFor } from '../behavior/id-ref-options';
import { numberBoundsResolverFor } from '@app/data-inspector/number-bounds';
import { singularLabel } from '../behavior/singular-label';
import { tagCreatorFor } from '../behavior/tag-creator-for';
import { tagSuggestionsResolverFor } from '@app/data-inspector/tag-suggestions';
import { useCreateRecordDialog } from '../behavior/useCreateRecordDialog';

const CreateRecordButton = (props: CreateRecordButtonProps) => {
  const { kind, label, schema, onCreated } = props;
  const {
    open, openDialog, cancelDialog, handleCreated,
    createSchema, initialRecord, requiredPaths, onCreate,
  } = useCreateRecordDialog(kind, schema, onCreated);

  if (!onCreate) return null;

  return (
    <>
      <Button variant="secondary" size="sm" onClick={openDialog}>{`+ New ${singularLabel(label)}`}</Button>
      <CreateRecordDialog
        open={open}
        title={`New ${singularLabel(label)}`}
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

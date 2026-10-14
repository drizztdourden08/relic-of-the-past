/* @layer renderer-components @kind component */
import { Text, Button } from '@drizztdourden08/tessera/primitives';
import type { BundleActionsProps } from './BundleActions.type';

const BundleActions = (props: BundleActionsProps) => {
  const { dirty, saving, readOnly, onDuplicate, onSaveNow, onExport, exporting, exportStatus } = props;
  return (
    <>
      {onSaveNow && !readOnly && (
        <Button variant="ghost" size="sm" disabled={!dirty || saving} onClick={onSaveNow}>Save now</Button>
      )}
      {onDuplicate && <Button variant="ghost" size="sm" onClick={onDuplicate}>Duplicate</Button>}
      {onExport && (
        <Button variant="ghost" size="sm" disabled={saving || exporting} onClick={onExport}>
          {exporting ? 'Exporting...' : 'Export .rlang'}
        </Button>
      )}
      {exportStatus && <Text variant="caption">{exportStatus}</Text>}
    </>
  );
};

export { BundleActions };

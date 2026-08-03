/* @layer renderer-components @kind component */
/**
 * Stands between a delete and the record it would remove, whenever something
 * else still points at it. Parameterized by nothing more than a label and a
 * hit list, so the same dialog serves a tag or an item group — or any future
 * kind a caller can compute `ReferenceHit[]` for.
 *
 * Built on the existing `Dialog` chrome rather than a new overlay: the only
 * thing this adds is the reference breakdown as its body, reusing
 * `ReferencedBy`'s own grouping and rendering rather than restating it.
 */
import { Box } from '../../primitives/Box';
import { Text } from '../../primitives/Text';
import { Dialog } from '../Dialog';
import { ReferencedBy } from '../RecordEditor';
import type { DeleteGuardDialogProps } from './DeleteGuardDialog.type';
import './DeleteGuardDialog.css';

const TITLE = 'Delete this record?';
const CONFIRM = 'Delete anyway';

const messageFor = (subjectLabel: string): string =>
  `${subjectLabel} is still referenced elsewhere. Deleting it will leave those references dangling.`;

const DeleteGuardDialog = (props: DeleteGuardDialogProps) => {
  const { open, subjectLabel, hits, error, onConfirm, onCancel } = props;
  return (
    <Dialog
      open={open}
      title={TITLE}
      message={messageFor(subjectLabel)}
      confirmLabel={CONFIRM}
      variant="danger"
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <Box className="delete-guard-dialog__hits">
        {error != null
          ? <Text as="p" className="delete-guard-dialog__error">{error}</Text>
          : <ReferencedBy hits={hits} />}
      </Box>
    </Dialog>
  );
};

export { DeleteGuardDialog };

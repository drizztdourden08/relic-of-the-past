/* @layer sanctuary-site @kind component */
import { Button } from '@drizztdourden08/tessera/primitives';
import { versionLabel } from '../../../files/file-versions';
import type { FileDetailButtonsProps } from './FileDetailButtons.type';

const FileDetailButtons = (props: FileDetailButtonsProps) => {
  const { file, actions, canDelete, canEdit, editing, onEdit, onDelete } = props;
  const { busy } = actions;
  return (
    <>
      <Button variant="primary" size="sm" disabled={busy} onClick={() => void actions.download(file.id)}>
        Download {versionLabel(file.currentVersion)}
      </Button>
      <Button variant="secondary" size="sm" disabled={busy} onClick={() => void actions.copyLink(file.id)}>Copy link</Button>
      {canEdit && (
        <Button variant="secondary" size="sm" disabled={busy || editing} onClick={onEdit}>Edit</Button>
      )}
      <Button
        variant="danger"
        size="sm"
        disabled={busy || !canDelete}
        title={canDelete ? undefined : 'owner or admin'}
        onClick={onDelete}
      >
        Delete
      </Button>
    </>
  );
};

export { FileDetailButtons };

/* @layer sanctuary-site @kind component */
/**
 * The selected file: its fields, the note, and the actions. Edit swaps the note for the
 * inline form; Delete asks once and is offered to the owner and to admins only.
 */
import { useState } from 'react';
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import { Dialog } from '@ds/composites/Dialog';
import { DetailPane } from '../../../components/DetailPane/DetailPane';
import type { DetailField } from '../../../components/DetailPane/DetailPane';
import { TypeChip } from '../../../components/TypeChip/TypeChip';
import { TagList } from '../../../components/TagList/TagList';
import { formatBytes } from '../../../lib/format-bytes';
import { formatDateTime } from '../../../lib/format-date';
import type { FileActions } from '../behavior/useFileActions';
import { FileEditForm } from './FileEditForm';

type FileDetailProps = {
  file: SanctuaryFile;
  knownTags: readonly string[];
  canDelete: boolean;
  canEdit: boolean;
  actions: FileActions;
  onClose: () => void;
};

const SHA_SHOWN = 8;

const shortSha = (sha: string | null) => (sha ? `${sha.slice(0, SHA_SHOWN)}...${sha.slice(-4)}` : 'not recorded');

const fieldsOf = (file: SanctuaryFile): DetailField[] => [
  { label: 'type', value: <TypeChip type={file.type} /> },
  { label: 'tags', value: <TagList tags={file.tags} /> },
  { label: 'version', value: file.version ?? '-' },
  { label: 'owner', value: file.owner.displayName },
  { label: 'size', value: `${formatBytes(file.bytes)} · sha256 ${shortSha(file.sha256)}` },
  { label: 'downloads', value: String(file.stats.downloads) },
  { label: 'uploaded', value: formatDateTime(file.createdAt) },
  ...(file.expiresAt === null ? [] : [{ label: 'expires', value: formatDateTime(file.expiresAt) }]),
];

const FileDetail = (props: FileDetailProps) => {
  const { file, knownTags, canDelete, canEdit, actions, onClose } = props;
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const { busy } = actions;

  const buttons = (
    <>
      <Button variant="primary" size="sm" disabled={busy} onClick={() => void actions.download(file.id)}>Download</Button>
      <Button variant="secondary" size="sm" disabled={busy} onClick={() => void actions.copyLink(file.id)}>Copy link</Button>
      {canEdit && (
        <Button variant="secondary" size="sm" disabled={busy || editing} onClick={() => setEditing(true)}>Edit</Button>
      )}
      <Button
        variant="danger"
        size="sm"
        disabled={busy || !canDelete}
        title={canDelete ? undefined : 'owner or admin'}
        onClick={() => setConfirming(true)}
      >
        Delete
      </Button>
    </>
  );

  return (
    <DetailPane title={file.name} fields={fieldsOf(file)} actions={buttons} notice={actions.notice} onClose={onClose}>
      {editing
        ? (
          <FileEditForm
            key={file.id}
            file={file}
            knownTags={knownTags}
            busy={busy}
            onSave={(patch) => { setEditing(false); void actions.patch(file.id, patch); }}
            onCancel={() => setEditing(false)}
          />
        )
        : (
          <Text as="p" className="files__note">{file.note || 'No note.'}</Text>
        )}
      <Dialog
        open={confirming}
        title="Delete file"
        message={`Delete "${file.name}"? The object is removed from the bucket.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { setConfirming(false); void actions.remove(file.id); }}
        onCancel={() => setConfirming(false)}
      />
    </DetailPane>
  );
};

export { FileDetail };
export type { FileDetailProps };

/* @layer sanctuary-site @kind component */
import { useState } from 'react';
import type { SanctuaryFile } from '@rotp/hub-contracts';
import { Button, Text } from '@drizztdourden08/tessera/primitives';
import { Dialog } from '@drizztdourden08/tessera/composites';
import { DetailPane, TagList } from '@rotp/design';
import type { DetailField } from '@rotp/design';
import { TypeChip } from '../../../components/TypeChip/TypeChip';
import { formatBytes, formatDateTime, mediaKindOf } from '@rotp/hub-client';
import { versionLabel } from '../../../files/file-versions';
import { FileEditForm } from './FileEditForm';
import { FileMedia } from './FileMedia';
import { VersionsPanel } from './VersionsPanel';
import { SHA_SHOWN } from './FileDetail.constants';
import type { FileDetailProps } from './FileDetail.type';

const shortSha = (sha: string | null) => (sha ? `${sha.slice(0, SHA_SHOWN)}...${sha.slice(-4)}` : 'not recorded');

const fieldsOf = (file: SanctuaryFile): DetailField[] => [
  { label: 'type', value: <TypeChip type={file.type} /> },
  { label: 'current', value: `${versionLabel(file.currentVersion)} · ${formatBytes(file.bytes)}` },
  { label: 'tags', value: <TagList tags={file.tags} /> },
  { label: 'app version', value: file.version ?? '-' },
  { label: 'owner', value: file.owner.displayName },
  { label: 'sha256', value: shortSha(file.sha256) },
  { label: 'downloads', value: String(file.stats.downloads) },
  { label: 'uploaded', value: formatDateTime(file.createdAt) },
  ...(file.expiresAt === null ? [] : [{ label: 'expires', value: formatDateTime(file.expiresAt) }]),
];

const FileDetail = (props: FileDetailProps) => {
  const { file, knownTags, types, canDelete, canEdit, actions, onDropVersion, onClose } = props;
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const { busy } = actions;
  const kind = mediaKindOf(file.contentType);

  const buttons = (
    <>
      <Button variant="primary" size="sm" disabled={busy} onClick={() => void actions.download(file.id)}>
        Download {versionLabel(file.currentVersion)}
      </Button>
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
    <DetailPane
      title={file.name}
      fields={fieldsOf(file)}
      actions={buttons}
      notice={actions.notice}
      onClose={onClose}
      media={kind && <FileMedia file={file} kind={kind} />}
      className="side-panel"
    >
      {editing
        ? (
          <FileEditForm
            key={file.id}
            file={file}
            knownTags={knownTags}
            types={types}
            busy={busy}
            onSave={(patch) => { setEditing(false); void actions.patch(file.id, patch); }}
            onCancel={() => setEditing(false)}
          />
        )
        : (
          <Text as="p" className="files__note">{file.note || 'No note.'}</Text>
        )}
      <VersionsPanel
        file={file}
        canManage={canEdit}
        busy={busy}
        actions={actions.versions}
        onDropVersion={(dropped) => onDropVersion(file, dropped)}
      />
      <Dialog
        open={confirming}
        title="Delete file"
        message={`Delete "${file.name}" and every version of it? The objects are removed from the bucket.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { setConfirming(false); void actions.remove(file.id); }}
        onCancel={() => setConfirming(false)}
      />
    </DetailPane>
  );
};

export { FileDetail };

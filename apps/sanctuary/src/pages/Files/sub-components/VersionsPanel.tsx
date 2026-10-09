/* @layer sanctuary-site @kind component */
import { useState } from 'react';
import { DropZone } from '@ds/primitives/DropZone';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { Dialog } from '@ds/composites/Dialog';
import { nextVersionNumber, versionLabel, versionsNewestFirst } from '../../../files/file-versions';
import { VersionRow } from './VersionRow';
import type { VersionsPanelProps } from './VersionsPanel.type';

const VersionsPanel = (props: VersionsPanelProps) => {
  const { file, canManage, busy, actions, onDropVersion } = props;
  const [deleting, setDeleting] = useState<number | null>(null);
  const versions = versionsNewestFirst(file);
  const next = versionLabel(nextVersionNumber(file));

  return (
    <Stack gap="xs" align="stretch" className="versions">
      <Text as="span" variant="caption" className="versions__title">versions</Text>
      {versions.map((version) => (
        <VersionRow
          key={version.n}
          version={version}
          current={version.n === file.currentVersion}
          canManage={canManage && versions.length > 1}
          busy={busy}
          onDownload={(n) => void actions.download(file.id, n)}
          onRestore={(n) => void actions.restore(file.id, n)}
          onDelete={setDeleting}
        />
      ))}
      <DropZone label={`drop a file here for ${next}`} disabled={busy} onDrop={(files) => onDropVersion(files[0])} />
      <Dialog
        open={deleting !== null}
        title="Delete version"
        message={deleting === null ? '' : `Delete ${versionLabel(deleting)} of "${file.name}"? Its bytes are removed from the bucket.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { if (deleting !== null) void actions.remove(file.id, deleting); setDeleting(null); }}
        onCancel={() => setDeleting(null)}
      />
    </Stack>
  );
};

export { VersionsPanel };

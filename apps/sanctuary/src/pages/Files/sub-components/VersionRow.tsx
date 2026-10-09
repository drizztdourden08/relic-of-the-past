/* @layer sanctuary-site @kind component */
import type { FileVersion } from '@shared/sanctuary/file-types';
import { Button, Flex, Status, Tag, Text } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { formatAgo } from '@site-kit/lib/format-date';
import { versionLabel } from '../../../files/file-versions';
import type { VersionRowProps } from './VersionRow.type';

const detailOf = (version: FileVersion) => {
  const parts = [version.by.displayName, formatAgo(version.createdAt)];
  if (version.note) parts.push(`"${version.note}"`);
  return parts.join(' · ');
};

const VersionRow = (props: VersionRowProps) => {
  const { version, current, canManage, busy, onDownload, onRestore, onDelete } = props;
  const { n } = version;
  const label = <Tag color={current ? 'primary' : 'neutral'}>{versionLabel(n)}</Tag>;
  const value = (
    <Flex gap="sm" align="center" wrap>
      <Text as="span" variant="caption">{detailOf(version)}</Text>
      {current && <Status variant="pill" tone="success">current</Status>}
    </Flex>
  );
  const action = (
    <>
      <Button variant="ghost" size="sm" disabled={busy} onClick={() => onDownload(n)}>Download</Button>
      {canManage && !current && (
        <>
          <Button variant="ghost" size="sm" disabled={busy} onClick={() => onRestore(n)}>Restore</Button>
          <Button variant="ghost" size="sm" disabled={busy} onClick={() => onDelete(n)}>Delete</Button>
        </>
      )}
    </>
  );
  return <ListItemRow name={label} columns={[{ primary: value }]} action={action} actionVisibility="always" className="versions__row" />;
};

export { VersionRow };

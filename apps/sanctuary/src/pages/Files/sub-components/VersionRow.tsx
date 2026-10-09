/* @layer sanctuary-site @kind component */
import type { FileVersion } from '@shared/sanctuary/file-types';
import { Button, Flex, Text } from '@drizztdourden08/tessera/primitives';
import { Row } from '@site-kit/components/Row/Row';
import { Chip } from '@site-kit/components/Chip/Chip';
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
  const label = <Chip tone={current ? 'gold' : 'neutral'}>{versionLabel(n)}</Chip>;
  const value = (
    <Flex gap="sm" align="center" wrap>
      <Text as="span" variant="caption">{detailOf(version)}</Text>
      {current && <Chip tone="green">current</Chip>}
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
  return <Row label={label} value={value} action={action} className="versions__row" />;
};

export { VersionRow };

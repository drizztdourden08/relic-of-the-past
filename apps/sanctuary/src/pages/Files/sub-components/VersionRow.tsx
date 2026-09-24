/* @layer sanctuary-site @kind component */
/**
 * One version in a file's history: its number, who uploaded it, when and what changed,
 * then Download, and for the owner or an admin Restore and Delete on a version that is
 * not the current one.
 */
import type { FileVersion } from '@shared/sanctuary/file-types';
import { Button } from '@ds/primitives/Button';
import { Flex } from '@ds/primitives/Flex';
import { Text } from '@ds/primitives/Text';
import { Row } from '../../../components/Row/Row';
import { Chip } from '../../../components/Chip/Chip';
import { formatAgo } from '../../../lib/format-date';
import { versionLabel } from '../../../files/file-versions';

type VersionRowProps = {
  version: FileVersion;
  current: boolean;
  /** Owner or admin: Restore and Delete are offered. */
  canManage: boolean;
  busy: boolean;
  onDownload: (n: number) => void;
  onRestore: (n: number) => void;
  onDelete: (n: number) => void;
};

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
export type { VersionRowProps };

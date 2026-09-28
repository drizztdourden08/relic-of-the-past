/* @layer store-site @kind component */
/**
 * The approved versions of an item, newest first: the version number, the day it was
 * approved, what changed and its size. The live one is marked, and one whose file the store
 * removed says so in place of its size. Given `onDelete`, each row ends with a Delete button.
 */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import type { StoreVersion } from '@shared/store/types';
import { Chip } from '@site-kit/components/Chip/Chip';
import { formatBytes } from '@site-kit/lib/format-bytes';
import { formatDay } from '@site-kit/lib/format-date';
import { approvedAtOf } from '../../catalog/approved-versions';
import './VersionHistory.css';

type VersionHistoryProps = {
  /** Approved versions, newest first. */
  versions: readonly StoreVersion[];
  liveVersion: number | null;
  /** A reviewer's delete; omitted, the table has no actions column. */
  onDelete?: (version: StoreVersion) => void;
  busy?: boolean;
};

const VersionHistory = (props: VersionHistoryProps) => {
  const { versions, liveVersion, onDelete, busy = false } = props;
  if (versions.length === 0) return <Text as="p" variant="caption">No version is approved yet.</Text>;
  const className = onDelete ? 'version-history version-history--actions' : 'version-history';
  return (
    <Box className={className} role="table" aria-label="Versions">
      <Box className="version-history__row version-history__head" role="row">
        <Text as="span" role="columnheader">Version</Text>
        <Text as="span" role="columnheader">Approved</Text>
        <Text as="span" role="columnheader">Changes</Text>
        <Text as="span" role="columnheader">Size</Text>
        {onDelete && <Text as="span" role="columnheader">Actions</Text>}
      </Box>
      {versions.map((version) => (
        <Box key={version.n} className="version-history__row" role="row">
          <Text as="span" role="cell" className="version-history__semver">
            {version.semver} {version.n === liveVersion && <Chip tone="green">live</Chip>}
          </Text>
          <Text as="span" role="cell" className="version-history__num">{formatDay(approvedAtOf(version))}</Text>
          <Text as="span" role="cell" className="version-history__changes">{version.changelog || '-'}</Text>
          <Text as="span" role="cell" className="version-history__num">
            {version.removed ? <Chip tone="muted">file removed</Chip> : formatBytes(version.bytes)}
          </Text>
          {onDelete && (
            <Box role="cell">
              <Button variant="ghost" size="sm" disabled={busy} onClick={() => onDelete(version)}>Delete</Button>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

export { VersionHistory };
export type { VersionHistoryProps };

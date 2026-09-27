/* @layer store-site @kind component */
/**
 * The approved versions of an item, newest first: the version number, the day it was
 * approved, what changed and its size. The live one is marked.
 */
import { Box } from '@ds/primitives/Box';
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
};

const VersionHistory = (props: VersionHistoryProps) => {
  const { versions, liveVersion } = props;
  if (versions.length === 0) return <Text as="p" variant="caption">No version is approved yet.</Text>;
  return (
    <Box className="version-history" role="table" aria-label="Versions">
      <Box className="version-history__row version-history__head" role="row">
        <Text as="span" role="columnheader">Version</Text>
        <Text as="span" role="columnheader">Approved</Text>
        <Text as="span" role="columnheader">Changes</Text>
        <Text as="span" role="columnheader">Size</Text>
      </Box>
      {versions.map((version) => (
        <Box key={version.n} className="version-history__row" role="row">
          <Text as="span" role="cell" className="version-history__semver">
            {version.semver} {version.n === liveVersion && <Chip tone="green">live</Chip>}
          </Text>
          <Text as="span" role="cell" className="version-history__num">{formatDay(approvedAtOf(version))}</Text>
          <Text as="span" role="cell" className="version-history__changes">{version.changelog || '-'}</Text>
          <Text as="span" role="cell" className="version-history__num">{formatBytes(version.bytes)}</Text>
        </Box>
      ))}
    </Box>
  );
};

export { VersionHistory };
export type { VersionHistoryProps };

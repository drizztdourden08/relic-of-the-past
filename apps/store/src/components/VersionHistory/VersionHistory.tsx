/* @layer store-site @kind component */
import { Box, Button, Status, Text, formatDate } from '@drizztdourden08/tessera/primitives';
import { formatBytes } from '@rotp/hub-client';
import { approvedAtOf } from '../../catalog/approved-versions/approved-at-of';
import type { VersionHistoryProps } from './VersionHistory.type';
import './VersionHistory.css';

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
            {version.semver} {version.n === liveVersion && <Status variant="pill" tone="success">live</Status>}
          </Text>
          <Text as="span" role="cell" className="version-history__num">{formatDate(approvedAtOf(version), 'iso', { length: 'short' })}</Text>
          <Text as="span" role="cell" className="version-history__changes">{version.changelog || '-'}</Text>
          <Text as="span" role="cell" className="version-history__num">
            {version.removed ? <Status variant="pill" tone="neutral">file removed</Status> : formatBytes(version.bytes)}
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
export type { VersionHistoryProps } from './VersionHistory.type';

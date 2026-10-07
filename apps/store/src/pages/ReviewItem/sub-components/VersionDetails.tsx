/* @layer store-site @kind component */
/**
 * Every field of a version: its file (name, size, checksum, container), its dates, where it
 * stands in review, and what its manifest said when the upload completed.
 */
import { SettingsSection } from '@ds/composites/SettingsSection';
import { StatRow } from '@ds/primitives/StatRow';
import type { KindFacts, StoreVersion } from '@shared/store/types';
import { formatBytes } from '@site-kit/lib/format-bytes';
import { formatDateTime } from '@site-kit/lib/format-date';
import { ReviewChip } from '../../../components/ReviewChip/ReviewChip';

type VersionDetailsProps = { version: StoreVersion };

type FactRow = { label: string; value: string };

const yesNo = (value: boolean) => (value ? 'yes' : 'no');

const factRows = (facts: KindFacts): FactRow[] => {
  switch (facts.kind) {
    case 'music': return [
      { label: 'title', value: facts.title },
      { label: 'tracks', value: String(facts.trackCount) },
      { label: 'sounds', value: String(facts.soundCount) },
      { label: 'files', value: facts.fileCount === null ? 'not listed' : String(facts.fileCount) },
      { label: 'deluxe', value: yesNo(facts.deluxe) },
    ];
    case 'character': return [
      { label: 'title', value: facts.title },
      { label: 'drawn by', value: facts.author || '-' },
    ];
    case 'language': return [
      { label: 'title', value: facts.title },
      { label: 'base', value: facts.base },
      { label: 'origin', value: facts.origin },
    ];
    default: return [];
  }
};

const VersionDetails = (props: VersionDetailsProps) => {
  const { version } = props;
  const { review } = version;
  return (
    <SettingsSection title={`Version ${version.semver}`}>
      <StatRow label="state" value={<ReviewChip state={review.state} />} />
      <StatRow label="file" value={version.name} mono />
      <StatRow label="size" value={`${formatBytes(version.bytes)} (${version.bytes} bytes)`} mono />
      <StatRow label="sha-256" value={version.sha256 ?? '-'} mono />
      <StatRow label="container" value={version.container} mono />
      <StatRow label="content type" value={version.contentType || '-'} mono />
      <StatRow label="uploaded by" value={version.by.displayName} />
      <StatRow label="created" value={formatDateTime(version.createdAt)} mono />
      <StatRow label="submitted" value={review.submittedAt ? formatDateTime(review.submittedAt) : 'not yet'} mono />
      {review.decidedAt && <StatRow label="decided" value={formatDateTime(review.decidedAt)} mono />}
      {version.removed && <StatRow label="file removed" value={`${formatDateTime(version.removed.at)} · ${version.removed.reason}`} />}
      {version.facts
        ? factRows(version.facts).map((row) => <StatRow key={row.label} label={row.label} value={row.value} />)
        : <StatRow label="manifest" value="could not be read at upload" />}
    </SettingsSection>
  );
};

export { VersionDetails };
export type { VersionDetailsProps };

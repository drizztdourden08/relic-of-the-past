/* @layer store-site @kind component */
/**
 * The picked entry of the queue: the author, what is live now, the pack's manifest line,
 * size and checksum, what changed, a link to download the upload and test it, the note to
 * the author (required to reject), then the reviewer's buttons (ReviewButtons).
 */
import { useState } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import downloadIcon from '@iconify-icons/lucide/download';
import { Field } from '@ds/primitives/Field';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { Textarea } from '@ds/primitives/Textarea';
import type { ReviewEntry } from '@shared/store/api-types';
import { DetailPane } from '@site-kit/components/DetailPane/DetailPane';
import type { DetailField } from '@site-kit/components/DetailPane/DetailPane';
import { ExternalLink } from '@site-kit/components/ExternalLink/ExternalLink';
import { Link } from '@site-kit/router/Link';
import { formatBytes } from '@site-kit/lib/format-bytes';
import { authorPath } from '../../../catalog/item-paths';
import { factsLine } from '../../../catalog/facts-line';
import { liveVersionOf } from '../../../catalog/approved-versions';
import { formatCount } from '../../../lib/format-count';
import { editOfEntry, versionOfEntry } from '../../../review/review-row';
import type { ReviewActions } from '../behavior/useReviewActions';
import { ListingEditPreview } from './ListingEditPreview';
import { ReviewButtons } from './ReviewButtons';

type ReviewDetailProps = {
  entry: ReviewEntry;
  actions: ReviewActions;
  onClose: () => void;
};

const SHA_EDGE = 4;

const fieldsOf = (entry: ReviewEntry): DetailField[] => {
  const { item } = entry;
  const version = versionOfEntry(entry);
  const live = liveVersionOf(item);
  const fields: DetailField[] = [
    { label: 'author', value: <Link to={authorPath(item.author.userId)}>{item.author.displayName}</Link> },
    { label: 'live now', value: live ? `${live.semver} · ${formatCount(item.stats.installs30d)} installs this month` : 'nothing yet' },
  ];
  if (!version) return fields;
  return [
    ...fields,
    { label: 'manifest', value: factsLine(version.facts) ?? 'could not be read' },
    { label: 'size', value: formatBytes(version.bytes) },
    { label: 'sha256', value: version.sha256 ? `${version.sha256.slice(0, SHA_EDGE)}...${version.sha256.slice(-SHA_EDGE)}` : '-' },
  ];
};

const ReviewDetail = (props: ReviewDetailProps) => {
  const { entry, actions, onClose } = props;
  const [note, setNote] = useState('');
  const version = versionOfEntry(entry);
  const edit = editOfEntry(entry);
  const title = version ? `${entry.item.name} · ${version.semver}` : `${entry.item.name} · listing`;

  const buttons = <ReviewButtons entry={entry} version={version} note={note} actions={actions} />;

  return (
    <DetailPane title={title} fields={fieldsOf(entry)} actions={buttons} notice={actions.notice} onClose={onClose} className="side-panel review-detail">
      {version?.changelog && (
        <Stack gap="xs" align="stretch">
          <Text as="span" variant="label">Changes</Text>
          <Text as="p" className="review-detail__text">{version.changelog}</Text>
        </Stack>
      )}
      {edit && <ListingEditPreview item={entry.item} edit={edit} />}
      {entry.downloadUrl && (
        <ExternalLink href={entry.downloadUrl} className="btn btn--secondary btn--sm review-detail__download">
          <IconifyIcon icon={downloadIcon} aria-hidden="true" /> Download to test
        </ExternalLink>
      )}
      <Field label="Note to the author" hint="Required to reject. The author sees it with your name." htmlFor="review-note">
        <Textarea id="review-note" rows={3} value={note} onChange={(event) => setNote(event.target.value)} />
      </Field>
    </DetailPane>
  );
};

export { ReviewDetail };
export type { ReviewDetailProps };

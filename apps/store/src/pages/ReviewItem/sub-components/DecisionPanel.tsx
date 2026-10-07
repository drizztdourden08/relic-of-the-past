/* @layer store-site @kind component */
/**
 * The review page's side column: the author, what is live now and the size, what changed
 * (the changelog, or the fields a listing edit sets), the note to the author (required to
 * reject), the reviewer's buttons from the version flow table, and a link to download the
 * upload and test it.
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
import { liveVersionOf } from '../../../catalog/approved-versions';
import { formatCount } from '../../../lib/format-count';
import { editOfEntry, versionOfEntry } from '../../../review/review-row';
import type { ReviewActions } from '../../Review/behavior/useReviewActions';
import { ReviewButtons } from '../../Review/sub-components/ReviewButtons';
import { ListingEditPreview } from './ListingEditPreview';

type DecisionPanelProps = {
  entry: ReviewEntry;
  actions: ReviewActions;
};

const fieldsOf = (entry: ReviewEntry): DetailField[] => {
  const { item } = entry;
  const version = versionOfEntry(entry);
  const live = liveVersionOf(item);
  const fields: DetailField[] = [
    { label: 'author', value: <Link to={authorPath(item.author.userId)}>{item.author.displayName}</Link> },
    { label: 'live now', value: live ? `${live.semver} · ${formatCount(item.stats.installs30d)} installs this month` : 'nothing yet' },
  ];
  return version ? [...fields, { label: 'size', value: formatBytes(version.bytes) }] : fields;
};

const DecisionPanel = (props: DecisionPanelProps) => {
  const { entry, actions } = props;
  const [note, setNote] = useState('');
  const version = versionOfEntry(entry);
  const edit = editOfEntry(entry);

  const buttons = (
    <>
      <ReviewButtons entry={entry} version={version} note={note} actions={actions} />
      {entry.downloadUrl && (
        <ExternalLink href={entry.downloadUrl} className="btn btn--secondary btn--sm">
          <IconifyIcon icon={downloadIcon} aria-hidden="true" /> Download
        </ExternalLink>
      )}
    </>
  );

  return (
    <DetailPane title="Decision" fields={fieldsOf(entry)} actions={buttons} notice={actions.notice} className="side-panel review-item__decision">
      {version && (
        <Stack gap="xs" align="stretch">
          <Text as="span" variant="label">Changes</Text>
          <Text as="p" className="review-item__text">{version.changelog.trim() || 'No changes listed.'}</Text>
        </Stack>
      )}
      {edit && <ListingEditPreview item={entry.item} edit={edit} />}
      <Field label="Note to the author" hint="Required to reject. The author sees it with your name." htmlFor="review-note">
        <Textarea id="review-note" rows={3} value={note} onChange={(event) => setNote(event.target.value)} />
      </Field>
    </DetailPane>
  );
};

export { DecisionPanel };
export type { DecisionPanelProps };

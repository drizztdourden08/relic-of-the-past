/* @layer store-site @kind component */
import { useState } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import downloadIcon from '@iconify-icons/lucide/download';
import { Field, Link, Stack, Text, Textarea } from '@drizztdourden08/tessera/primitives';
import type { ReviewEntry } from '@rotp/hub-contracts';
import { DetailPane } from '@site-kit/components/DetailPane/DetailPane';
import type { DetailField } from '@site-kit/components/DetailPane/DetailPane';
import { AppLink } from '@site-kit/router/AppLink';
import { formatBytes } from '@rotp/hub-client';
import { authorPath } from '../../../catalog/item-paths';
import { liveVersionOf } from '../../../catalog/approved-versions';
import { formatCount } from '../../../lib/format-count';
import { editOfEntry, versionOfEntry } from '../../../review/review-row';
import { ReviewButtons } from '../../Review/sub-components/ReviewButtons';
import type { DecisionPanelProps } from './DecisionPanel.type';
import { ListingEditPreview } from './ListingEditPreview';

const fieldsOf = (entry: ReviewEntry): DetailField[] => {
  const { item } = entry;
  const version = versionOfEntry(entry);
  const live = liveVersionOf(item);
  const fields: DetailField[] = [
    { label: 'author', value: <AppLink to={authorPath(item.author.userId)}>{item.author.displayName}</AppLink> },
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
        <Link href={entry.downloadUrl} external className="btn btn--secondary btn--toned btn--sm">
          <IconifyIcon icon={downloadIcon} aria-hidden="true" /> Download
        </Link>
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

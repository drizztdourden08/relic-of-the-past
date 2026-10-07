/* @layer store-site @kind component */
/**
 * The picked row: a version or a listing edit with its whole review record (state,
 * submitted, who reviewed it, when, and their note), the file and what became of it, what
 * changed, then what the author can do: the version's own buttons from the flow table,
 * start the next version, edit the listing, open the item.
 */
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import type { StoreItem, StoreVersion } from '@shared/store/types';
import { DetailPane } from '@site-kit/components/DetailPane/DetailPane';
import { Link } from '@site-kit/router/Link';
import type { PublicationTarget } from '../../../publications/publication-row';
import { itemPath } from '../../../catalog/item-paths';
import { liveVersionOf } from '../../../catalog/approved-versions';
import type { PublicationActions } from '../behavior/usePublicationActions';
import { detailFieldsOf, detailTitleOf, entryOf } from '../behavior/publication-detail';
import { VersionActions } from './VersionActions';

type PublicationDetailProps = {
  item: StoreItem;
  target: PublicationTarget;
  actions: PublicationActions;
  onClose: () => void;
};

const STATE_NOTES: Partial<Record<StoreVersion['review']['state'], string>> = {
  ready: 'Uploaded and checked. Send it for review when you are ready.',
  rejected: 'Read the note, then resubmit this file or upload a new version.',
};

const noteFor = (item: StoreItem, version: StoreVersion | null): string | null => {
  if (!version || version.removed) return null;
  const live = liveVersionOf(item);
  if (version.review.state === 'waiting') return live ? `${live.semver} stays live until this one is approved.` : null;
  return STATE_NOTES[version.review.state] ?? null;
};

const PublicationDetail = (props: PublicationDetailProps) => {
  const { item, target, actions, onClose } = props;
  const { version, edit } = entryOf(item, target);
  const note = version?.review.note || edit?.review.note;

  const buttons = (
    <>
      {version && <VersionActions item={item} version={version} actions={actions} />}
      <Link to={`/publications/${encodeURIComponent(item.id)}/version`} className="btn btn--secondary btn--sm">New version</Link>
      <Link to={`/publications/${encodeURIComponent(item.id)}/listing`} className="btn btn--tertiary btn--sm">Edit listing</Link>
      {item.status === 'published' && <Link to={itemPath(item)} className="btn btn--tertiary btn--sm">Open {'›'}</Link>}
    </>
  );

  return (
    <DetailPane
      title={detailTitleOf(item, target)}
      fields={detailFieldsOf(item, target, Date.now())}
      actions={buttons}
      notice={actions.notice ?? noteFor(item, version)}
      onClose={onClose}
      className="side-panel publication-detail"
    >
      {version?.changelog && (
        <Stack gap="xs" align="stretch">
          <Text as="span" variant="label">Changes</Text>
          <Text as="p" className="publication-detail__text">{version.changelog}</Text>
        </Stack>
      )}
      {note && (
        <Stack gap="xs" align="stretch">
          <Text as="span" variant="label">Reviewer's note</Text>
          <Text as="p" className="publication-detail__text publication-detail__note">{note}</Text>
        </Stack>
      )}
    </DetailPane>
  );
};

export { PublicationDetail };
export type { PublicationDetailProps };

/* @layer store-site @kind component */
/**
 * The picked row: a version or a listing edit with its whole review record (state,
 * submitted, who reviewed it, when, and their note), the file and what changed, then what
 * the author can do: withdraw a waiting version, download an approved one, start the next
 * version, edit the listing, open the item.
 */
import { Button } from '@ds/primitives/Button';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import type { StoreItem } from '@shared/store/types';
import { DetailPane } from '@site-kit/components/DetailPane/DetailPane';
import { Link } from '@site-kit/router/Link';
import type { PublicationTarget } from '../../../publications/publication-row';
import { itemPath } from '../../../catalog/item-paths';
import { liveVersionOf } from '../../../catalog/approved-versions';
import type { PublicationActions } from '../behavior/usePublicationActions';
import { detailFieldsOf, detailTitleOf, entryOf } from '../behavior/publication-detail';

type PublicationDetailProps = {
  item: StoreItem;
  target: PublicationTarget;
  actions: PublicationActions;
  onClose: () => void;
};

const PublicationDetail = (props: PublicationDetailProps) => {
  const { item, target, actions, onClose } = props;
  const { version, edit } = entryOf(item, target);
  const live = liveVersionOf(item);
  const waiting = version?.review.state === 'waiting';
  const note = version?.review.note || edit?.review.note;

  const buttons = (
    <>
      {version && waiting && (
        <Button variant="danger" size="sm" disabled={actions.busy} onClick={() => void actions.withdraw(item.id, version.n)}>Withdraw</Button>
      )}
      {version?.review.state === 'approved' && (
        <Button variant="secondary" size="sm" disabled={actions.busy} onClick={() => void actions.download(item.id, version.n)}>Download</Button>
      )}
      <Link to={`/publications/${encodeURIComponent(item.id)}/version`} className="btn btn--secondary btn--sm">New version</Link>
      <Link to={`/publications/${encodeURIComponent(item.id)}/listing`} className="btn btn--tertiary btn--sm">Edit listing</Link>
      {item.status === 'published' && <Link to={itemPath(item)} className="btn btn--tertiary btn--sm">Open {'›'}</Link>}
    </>
  );

  const liveNote = waiting && live ? `${live.semver} stays live until this one is approved.` : null;

  return (
    <DetailPane
      title={detailTitleOf(item, target)}
      fields={detailFieldsOf(item, target)}
      actions={buttons}
      notice={actions.notice ?? liveNote}
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

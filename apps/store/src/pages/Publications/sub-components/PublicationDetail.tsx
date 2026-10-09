/* @layer store-site @kind component */
import { Stack, Text } from '@drizztdourden08/tessera/primitives';
import type { StoreItem, StoreVersion } from '@rotp/hub-contracts';
import { DetailPane, AppLink } from '@rotp/design';
import { itemPath } from '../../../catalog/item-paths';
import { liveVersionOf } from '../../../catalog/approved-versions';
import { detailFieldsOf, detailTitleOf, entryOf } from '../behavior/publication-detail';
import { STATE_NOTES } from './PublicationDetail.constants';
import type { PublicationDetailProps } from './PublicationDetail.type';
import { VersionActions } from './VersionActions';

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
      <AppLink to={`/publications/${encodeURIComponent(item.id)}/version`} className="btn btn--secondary btn--toned btn--sm">New version</AppLink>
      <AppLink to={`/publications/${encodeURIComponent(item.id)}/listing`} className="btn btn--tertiary btn--toned btn--sm">Edit listing</AppLink>
      {item.status === 'published' && <AppLink to={itemPath(item)} className="btn btn--tertiary btn--toned btn--sm">Open {'›'}</AppLink>}
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

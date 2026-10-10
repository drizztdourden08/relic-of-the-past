/* @layer store-site @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import reviewIcon from '@iconify-icons/lucide/clipboard-check';
import { Flex, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { SettingsPage } from '@drizztdourden08/tessera/composites';
import { AppLink } from '@rotp/design';
import { ReviewChip } from '../../components/ReviewChip/ReviewChip';
import { KIND_ICONS } from '../../kinds';
import { editOfEntry, versionOfEntry } from '../../review/review-row';
import { useReviewItemPage } from './behavior/useReviewItemPage';
import { DecisionPanel } from './sub-components/DecisionPanel';
import { ReviewItemTab } from './sub-components/ReviewItemTab';
import type { ReviewItemProps } from './ReviewItem.type';
import './ReviewItem.css';

const ReviewItem = (props: ReviewItemProps) => {
  const { rowId } = props;
  const page = useReviewItemPage(rowId);
  const { entry, preview } = page;
  const back = <AppLink to={page.listPath} className="review-item__back">{'‹'} Reviewer Hub</AppLink>;

  if (!entry || !preview) {
    return (
      <SettingsPage icon={<IconifyIcon icon={reviewIcon} />} title="Review" actions={back}>
        <Text as="p" variant="caption" role={page.error ? 'alert' : 'status'}>{page.loading ? 'Loading the entry...' : page.error}</Text>
      </SettingsPage>
    );
  }

  const version = versionOfEntry(entry);
  const edit = editOfEntry(entry);
  const state = version?.review.state ?? edit?.review.state ?? 'waiting';
  const header = (
    <Flex align="center" gap="sm" wrap className="review-item__head">
      <ReviewChip state={state} />
      <Text as="span" variant="caption" className="review-item__semver">{version ? version.semver : 'listing edit'}</Text>
      {back}
    </Flex>
  );

  return (
    <Flex gap="md" align="stretch" className="review-item">
      <SettingsPage icon={<IconifyIcon icon={KIND_ICONS[entry.item.kind]} />} title={preview.item.name} tabs={page.tabs} actions={header} className="review-item__page">
        <ReviewItemTab page={page} entry={entry} preview={preview} version={version} />
      </SettingsPage>
      <Stack as="aside" align="stretch" className="review-item__aside">
        <DecisionPanel key={rowId} entry={entry} actions={page.actions} />
      </Stack>
    </Flex>
  );
};

export { ReviewItem };
export type { ReviewItemProps } from './ReviewItem.type';

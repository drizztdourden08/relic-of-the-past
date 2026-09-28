/* @layer store-site @kind component */
/**
 * One entry of the Reviewer Hub as a full page: the item's name in the header with its
 * review state, the Store page, Contents and Details tabs, and the decision in the side
 * column. A row of the list opens it at `/review/:rowId`. Everything stateful lives in
 * useReviewItemPage.
 */
import reviewIcon from '@iconify-icons/lucide/clipboard-check';
import { Flex } from '@ds/primitives/Flex';
import { Text } from '@ds/primitives/Text';
import { SideColumn } from '@site-kit/layout/SideColumn/SideColumn';
import { Link } from '@site-kit/router/Link';
import { ReviewChip } from '../../components/ReviewChip/ReviewChip';
import { TitledPage } from '../../layout/TitledPage/TitledPage';
import { KIND_ICONS } from '../../lib/kinds';
import { editOfEntry, versionOfEntry } from '../../review/review-row';
import { useReviewItemPage } from './behavior/useReviewItemPage';
import { ContentsPanel } from './sub-components/ContentsPanel';
import { DecisionPanel } from './sub-components/DecisionPanel';
import { PackDetails } from './sub-components/PackDetails';
import { StorePagePreview } from './sub-components/StorePagePreview';
import './ReviewItem.css';

type ReviewItemProps = {
  /** From the `/review/:rowId` route: `<itemId>~v<n>` or `<itemId>~<editId>`. */
  rowId: string;
};

const ReviewItem = (props: ReviewItemProps) => {
  const { rowId } = props;
  const page = useReviewItemPage(rowId);
  const { entry, preview } = page;
  const back = <Link to={page.listPath} className="review-item__back">{'‹'} Reviewer Hub</Link>;

  if (!entry || !preview) {
    return (
      <TitledPage icon={reviewIcon} title="Review" actions={back}>
        <Text as="p" variant="caption" role={page.error ? 'alert' : 'status'}>{page.loading ? 'Loading the entry...' : page.error}</Text>
      </TitledPage>
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
  const aside = (
    <SideColumn>
      <DecisionPanel key={rowId} entry={entry} actions={page.actions} />
    </SideColumn>
  );

  return (
    <TitledPage icon={KIND_ICONS[entry.item.kind]} title={preview.item.name} tabs={page.tabs} actions={header} aside={aside}>
      {page.tab === 'store' && <StorePagePreview preview={preview} />}
      {page.tab === 'contents' && <ContentsPanel kind={entry.item.kind} pack={page.pack} target={page.target} />}
      {page.tab === 'details' && <PackDetails item={preview.item} version={version} pack={page.pack} noPack={page.target.noPack} />}
    </TitledPage>
  );
};

export { ReviewItem };
export type { ReviewItemProps };

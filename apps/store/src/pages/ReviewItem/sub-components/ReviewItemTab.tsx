/* @layer store-site @kind component */
import { PackContentsPanel } from '../../../components/PackContentsPanel/PackContentsPanel';
import { PackDetails } from './PackDetails';
import { StorePagePreview } from './StorePagePreview';
import type { ReviewItemTabProps } from './ReviewItemTab.type';

const ReviewItemTab = (props: ReviewItemTabProps) => {
  const { page, entry, preview, version } = props;
  if (page.tab === 'store') return <StorePagePreview preview={preview} />;
  if (page.tab === 'details') return <PackDetails item={preview.item} version={version} pack={page.pack} noPack={page.target.noPack} />;
  return (
    <PackContentsPanel
      kind={entry.item.kind}
      pack={page.pack}
      noPack={page.target.noPack}
      note={page.target.note}
      className="review-item__contents"
    />
  );
};

export { ReviewItemTab };

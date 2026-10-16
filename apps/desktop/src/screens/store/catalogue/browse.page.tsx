/* @layer renderer-app @kind component */
import type { PageProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { isSignedIn } from '@app/shell/show-rules';
import { itemParam } from '@app/views/Store/behavior/item-param';
import { StoreCatalogueView } from '@app/views/Store/sub-components/StoreCatalogueView';

const meta: ScreenMeta = { title: 'Browse', icon: 'layout-grid', order: 1, fill: true, when: isSignedIn, keywords: ['catalogue', 'store', 'every pack', 'all packs'] };

const BrowsePage = (props: PageProps) => <StoreCatalogueView kind={null} item={itemParam(props.params)} />;

export default BrowsePage;
export { meta };

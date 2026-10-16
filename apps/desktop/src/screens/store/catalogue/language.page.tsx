/* @layer renderer-app @kind component */
import type { PageProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { isSignedIn } from '@app/shell/show-rules';
import { itemParam } from '@app/views/Store/behavior/item-param';
import { StoreCatalogueView } from '@app/views/Store/sub-components/StoreCatalogueView';

const meta: ScreenMeta = { title: 'Languages', icon: 'languages', order: 4, fill: true, when: isSignedIn, keywords: ['translation', 'text'] };

const LanguagePage = (props: PageProps) => <StoreCatalogueView kind="language" item={itemParam(props.params)} />;

export default LanguagePage;
export { meta };

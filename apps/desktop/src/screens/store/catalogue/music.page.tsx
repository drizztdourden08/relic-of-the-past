/* @layer renderer-app @kind component */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { PageProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { isSignedIn } from '@app/shell/show-rules';
import { itemParam } from '@app/views/Store/behavior/item-param';
import { StoreCatalogueView } from '@app/views/Store/sub-components/StoreCatalogueView';

const meta: ScreenMeta = { title: msg('views-store:screen.music'), icon: 'music', showHeader: true, order: 2, fill: true, when: isSignedIn, keywords: ['msu', 'soundtrack', 'songs'] };

const MusicPage = (props: PageProps) => <StoreCatalogueView kind="music" item={itemParam(props.params)} />;

export default MusicPage;
export { meta };

/* @layer renderer-app @kind component */
import type { PageProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { isSignedIn } from '@app/shell/show-rules';
import { itemParam } from '@app/views/Store/behavior/item-param';
import { StoreCatalogueView } from '@app/views/Store/sub-components/StoreCatalogueView';

const meta: ScreenMeta = { title: 'Characters', icon: 'person-standing', order: 3, fill: true, when: isSignedIn, keywords: ['sprites', 'player sprite', 'skins'] };

const CharacterPage = (props: PageProps) => <StoreCatalogueView kind="character" item={itemParam(props.params)} />;

export default CharacterPage;
export { meta };

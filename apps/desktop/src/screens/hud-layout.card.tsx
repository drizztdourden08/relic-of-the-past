/* @layer renderer-app @kind component */
import type { ScreenMeta } from '@drizztdourden08/brock-react';
import { isExperimental } from '@app/shell/show-rules';
import { HudLayoutEditor } from '@app/views/HudLayoutEditor';

const meta: ScreenMeta = { title: 'HUD Layout Editor', icon: 'layout-list', bare: true, menu: 'Advanced', when: isExperimental, keywords: ['hud', 'layout', 'editor', 'glyphs', 'slots'] };

const HudLayoutCard = () => <HudLayoutEditor />;

export default HudLayoutCard;
export { meta };

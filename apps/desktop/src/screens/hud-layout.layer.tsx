/* @layer renderer-app @kind component */
import type { CardProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { FreeWindow } from '@app/shell/free-window';
import { isExperimental } from '@app/shell/show-rules';
import { HudLayoutEditor } from '@app/views/HudLayoutEditor';

const meta: ScreenMeta = { title: 'HUD Layout Editor', icon: 'layout-list', menu: 'Advanced', when: isExperimental, keywords: ['hud', 'layout', 'editor', 'glyphs', 'slots'] };

const HudLayoutLayer = (props: CardProps) => (
  <FreeWindow title={meta.title ?? 'HUD Layout Editor'} onClose={props.close}><HudLayoutEditor /></FreeWindow>
);

export default HudLayoutLayer;
export { meta };

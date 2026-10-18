/* @layer renderer-app @kind component */
import type { CardProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { HudLayoutEditor } from '@app/views/HudLayoutEditor';
import { isExperimental } from '@app/shell/show-rules';

const meta: ScreenMeta = { title: 'HUD Layout Editor', icon: 'layout-list', menu: 'Advanced', when: isExperimental, keywords: ['hud', 'layout', 'editor', 'glyphs', 'slots'] };

const HudLayoutLayer = (props: CardProps) => {
  const { close } = props;
  return <HudLayoutEditor onClose={close} />;
};

export default HudLayoutLayer;
export { meta };

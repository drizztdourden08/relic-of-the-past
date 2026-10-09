/* @layer renderer-app @kind component */
import type { CardProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { useGameSession } from '@app/hooks/useGameSession';
import { SpriteDebug } from '@app/views/SpriteDebug';

const meta: ScreenMeta = { title: 'Sprite Debug', icon: 'bug', menu: 'Advanced', devOnly: true, shortcut: 'Mod+Shift+D', keywords: ['sprite', 'review', 'items', 'debug'] };

const SpriteDebugLayer = (props: CardProps) => {
  const { close } = props;
  const { activeProfile } = useGameSession().profileMgmt;
  return <SpriteDebug onClose={close} romFile={activeProfile?.romFile ?? ''} />;
};

export default SpriteDebugLayer;
export { meta };

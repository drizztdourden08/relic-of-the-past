/* @layer renderer-app @kind component */
import type { CardProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { useGameSession } from '@app/hooks/useGameSession';
import { FreeWindow } from '@app/shell/free-window';
import { SpriteDebug } from '@app/views/SpriteDebug';

const meta: ScreenMeta = { title: 'Sprite Debug', icon: 'bug', menu: 'Advanced', devOnly: true, shortcut: 'Mod+Shift+D', keywords: ['sprite', 'review', 'items', 'debug'] };

const SpriteDebugLayer = (props: CardProps) => {
  const { activeProfile } = useGameSession().profileMgmt;
  return (
    <FreeWindow title={meta.title ?? 'Sprite Debug'} scroll onClose={props.close}>
      <SpriteDebug romFile={activeProfile?.romFile ?? ''} />
    </FreeWindow>
  );
};

export default SpriteDebugLayer;
export { meta };

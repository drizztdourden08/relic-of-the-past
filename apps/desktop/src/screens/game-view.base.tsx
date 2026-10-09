/* @layer renderer-app @kind component */
import type { ScreenMeta } from '@drizztdourden08/brock-react';
import { GameView } from '@app/views/GameView';

const meta: ScreenMeta = { title: 'Game view', icon: 'gamepad-2', requiresProfile: false, menu: false };

const GameViewBase = () => <GameView />;

export default GameViewBase;
export { meta };

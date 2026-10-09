/* @layer renderer-app @kind component */
import type { ScreenMeta } from '@drizztdourden08/brock-react';
import { GameView } from '@app/views/GameView';

const meta: ScreenMeta = { title: 'Game', icon: 'gamepad-2', requiresProfile: false };

const GameViewBase = () => <GameView />;

export default GameViewBase;
export { meta };

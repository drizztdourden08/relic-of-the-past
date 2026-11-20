/* @layer renderer-app @kind component */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { ScreenMeta } from '@drizztdourden08/brock-react';
import { GameView } from '@app/views/GameView';

const meta: ScreenMeta = { title: msg('views-game-layer:screen.title'), icon: 'gamepad-2', requiresProfile: false, menu: false };

const GameViewBase = () => <GameView />;

export default GameViewBase;
export { meta };

/* @layer renderer-widgets @kind logic */
import { isMsuSessionActive } from '@app/game/msu-session';

const readSessionActive = (): boolean => window.__musicWidgetFeed?.active ?? isMsuSessionActive();

export { readSessionActive };

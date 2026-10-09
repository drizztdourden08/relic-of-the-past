/* @layer shared-game @kind logic */
import type { DialogKind } from '../dialog-frame.types';
import { MENU_TOPLEFT } from './dialog-kind.constants';

const kindOf = (bordered: boolean, story: boolean, topleft: number): DialogKind => {
  if (story) return 'story';
  if (topleft === MENU_TOPLEFT) return 'menu';
  return bordered ? 'box' : 'floating';
};

export { kindOf };

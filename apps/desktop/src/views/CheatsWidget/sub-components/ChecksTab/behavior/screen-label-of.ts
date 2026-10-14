/* @layer renderer-widgets @kind logic */
import { getScreen } from '@rotp/game-data';
import type { CheckRecord } from '@rotp/game-data';

const screenLabelOf = (check: CheckRecord): string => {
  if (!check.screenId) return '';
  const screen = getScreen(check.screenId);
  return screen.name;
};

export { screenLabelOf };

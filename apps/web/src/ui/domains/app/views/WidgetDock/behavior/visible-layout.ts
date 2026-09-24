/* @layer renderer-components @kind logic */
/**
 * The layout the dock draws: the stored one with every gated widget taken out,
 * so a hidden widget reserves no space. A game-only widget hides while a page
 * is open or the game is not running; a devOnly widget hides while dev tools
 * are off; a startup-forced id is exempt from the no-game and dev gates but
 * never from the open-page gate. Pane keys survive, so an edit made on this
 * tree maps back onto the stored one.
 */
import type { WidgetId, WidgetLayout } from '@shared/types/widget-layout';
import { GAME_NODE, removeWidget, widgetsIn } from '@ds/composites/DockLayout/behavior/edit-tree';
import { getWidgetDefinition } from '@ds/composites/Widget/behavior/createWidgetState';
import { frameOf } from '@app/stores/widget-layout-edits';
import type { WidgetGates } from '../WidgetDock.type';

const isHidden = (layout: WidgetLayout, id: WidgetId, gates: WidgetGates): boolean => {
  const def = getWidgetDefinition(id);
  if (!def || !gates.contentIds.includes(id)) return true;
  const forced = gates.forcedIds.includes(id);
  const gameOnly = frameOf(layout, id).show === 'game-only';
  if (gameOnly && gates.pageOpen) return true;
  if (gameOnly && !gates.gameRunning && !forced) return true;
  if (def.devOnly && !gates.developerToolsEnabled && !forced) return true;
  return false;
};

const visibleLayoutOf = (layout: WidgetLayout, gates: WidgetGates): WidgetLayout => {
  const present = [...widgetsIn(layout.dock), ...layout.floating.map((f) => f.id)];
  const hidden = present.filter((id) => isHidden(layout, id, gates));
  if (hidden.length === 0) return layout;
  return {
    ...layout,
    dock: hidden.reduce((tree, id) => removeWidget(tree, id) ?? GAME_NODE, layout.dock),
    floating: layout.floating.filter((f) => !hidden.includes(f.id)),
  };
};

export { isHidden, visibleLayoutOf };

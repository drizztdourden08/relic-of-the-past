/* @layer renderer-components @kind logic */
import type { WidgetLayout } from '@shared/types/widget-layout';
import { GAME_NODE } from '../../DockLayout/behavior/edit-tree';
import type { WidgetDefinition } from '../Widget.type';
import { WIDGET_DEFINITIONS } from '../Widget.constants';

const getWidgetDefinition = (id: string): WidgetDefinition | undefined => {
  return WIDGET_DEFINITIONS.find((d) => d.id === id);
};

/** The layout a profile starts from: the game alone, nothing open, no frame overrides. */
const createDefaultLayout = (): WidgetLayout => ({
  v: 2,
  dock: GAME_NODE,
  floating: [],
  popped: [],
  frame: {},
});

/** Ids of every widget gated behind the developerToolsEnabled setting. The render filter,
 *  the menu builder, and the gate-flip close all read this one list. */
const getDevOnlyWidgetIds = (): string[] => WIDGET_DEFINITIONS.filter((d) => d.devOnly).map((d) => d.id);

export { createDefaultLayout, getDevOnlyWidgetIds, getWidgetDefinition };

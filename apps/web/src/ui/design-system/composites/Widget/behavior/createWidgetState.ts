/* @layer renderer-components @kind logic */
import type { WidgetDefinition, WidgetState, WidgetLayout } from '../Widget.type';
import { WIDGET_DEFINITIONS } from '../Widget.constants';

const createDefaultWidgetState = (def: WidgetDefinition, order = 0): WidgetState => {
  return {
    id: def.id,
    mode: 'docked',
    side: def.defaultSide,
    order,
    opacity: 0.92,
    visibility: def.defaultVisibility,
    visible: false,
    x: 100 + order * 30,
    y: 100 + order * 30,
    width: def.defaultFloatingSize.width,
    height: def.defaultFloatingSize.height,
    dockedSize: def.defaultDockedSize,
    exclusive: false,
  };
};

const getWidgetDefinition = (id: string): WidgetDefinition | undefined => {
  return WIDGET_DEFINITIONS.find((d) => d.id === id);
};

const createDefaultLayout = (): WidgetLayout => {
  return {
    widgets: WIDGET_DEFINITIONS.map((def, i) => createDefaultWidgetState(def, i)),
  };
};

/** Ids of every widget gated behind the developerToolsEnabled setting — the single source
 *  of truth consulted by the render filter, the menu builder, and the gate-flip close. */
const getDevOnlyWidgetIds = (): string[] => WIDGET_DEFINITIONS.filter((d) => d.devOnly).map((d) => d.id);

export { createDefaultLayout, createDefaultWidgetState, getDevOnlyWidgetIds, getWidgetDefinition };

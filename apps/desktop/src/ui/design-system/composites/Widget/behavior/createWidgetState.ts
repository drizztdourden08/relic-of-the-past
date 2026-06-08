/* @layer renderer-components @kind logic */
import type { WidgetDefinition, WidgetState, WidgetLayout } from '../types';
import { WIDGET_DEFINITIONS } from '../constants';

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

export { createDefaultLayout, createDefaultWidgetState, getWidgetDefinition };

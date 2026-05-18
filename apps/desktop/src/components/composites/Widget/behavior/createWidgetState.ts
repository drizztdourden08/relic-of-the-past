import type { WidgetDefinition, WidgetState, WidgetLayout } from '../types';
import { WIDGET_DEFINITIONS } from '../constants';

export const createDefaultWidgetState = (def: WidgetDefinition, order = 0): WidgetState => {
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
  };
};

export const getWidgetDefinition = (id: string): WidgetDefinition | undefined => {
  return WIDGET_DEFINITIONS.find((d) => d.id === id);
};

export const createDefaultLayout = (): WidgetLayout => {
  return {
    widgets: WIDGET_DEFINITIONS.map((def, i) => createDefaultWidgetState(def, i)),
  };
};

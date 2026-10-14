/* @layer renderer-components @kind component */
import { LightToolOptions } from './LightToolOptions';
import { ShapeToolOptions } from './ShapeToolOptions';
import type { ShadowToolOptionsProps } from './ShadowToolOptions.type';

const ShadowToolOptions = ({ activeTool, hasSelection }: ShadowToolOptionsProps) => {
  if (hasSelection) return null;
  if (activeTool === 'polygon' || activeTool === 'shape-light') return <ShapeToolOptions />;
  if (activeTool === 'point-light') return <LightToolOptions />;
  return null;
};

export { ShadowToolOptions };

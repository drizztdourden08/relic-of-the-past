/* @layer site-kit @kind types */
import type { SchemaLike } from '@drizztdourden08/tessera/data';
import type { useSurfaceView } from '../../hooks/useSurfaceView/useSurfaceView';

type SurfaceView = ReturnType<typeof useSurfaceView>;

type SurfaceFilterBarProps = {
  schema: SchemaLike;
  view: SurfaceView;
  placeholder: string;
  label: string;
};

export type { SurfaceFilterBarProps };

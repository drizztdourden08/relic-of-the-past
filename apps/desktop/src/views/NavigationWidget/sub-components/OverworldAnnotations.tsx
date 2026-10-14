/* @layer renderer-widgets @kind component */
import { overworldCellOrigin } from '../behavior/overworld-cell-origin';
import { AnnotationLayer } from './AnnotationLayer';
import type { OverworldAnnotationsProps } from './OverworldMinimap.type';

const OverworldAnnotations = ({ bundle, grid, annotations }: OverworldAnnotationsProps) => (
  <>
    {annotations.map((set) => {
      const slot = bundle.screens.indexOf(set.screenIndex);
      if (slot < 0) return null;
      const { left, top } = overworldCellOrigin(grid, slot);
      return (
        <AnnotationLayer
          key={`anno-set-${set.screenIndex}`}
          annotations={set}
          cellLeft={left}
          cellTop={top}
          cellW={grid.cellW}
          cellH={grid.cellH}
        />
      );
    })}
  </>
);

export { OverworldAnnotations };

/* @layer renderer-app @kind component */
import type { CSSProperties } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { SNAP_CELL_SIZE } from '@rotp/input-mapping';
import { GRID_QUADRANTS } from './TouchEditorGrid.constants';
import './TouchEditorGrid.css';
import type { TouchEditorGridProps } from './TouchEditorGrid.type';

const TouchEditorGrid = ({ box, snap, guides }: TouchEditorGridProps) => {
  const cellPx = SNAP_CELL_SIZE[snap.cell] * Math.min(box.width, box.height);
  const style = { '--touch-grid-cell': `${cellPx}px` } as CSSProperties;
  const edgeX = guides && guides.x.side !== 'center' ? guides.x : null;
  const edgeY = guides && guides.y.side !== 'center' ? guides.y : null;

  return (
    <Box className="touch-editor-grid" style={style} aria-hidden="true">
      {snap.enabled && GRID_QUADRANTS.map((quadrant) => (
        <Box key={quadrant} className="touch-editor-grid__quadrant" data-quadrant={quadrant} />
      ))}
      <Box className="touch-editor-grid__mirror" data-axis="x" data-active={guides?.x.side === 'center'} />
      <Box className="touch-editor-grid__mirror" data-axis="y" data-active={guides?.y.side === 'center'} />
      {edgeX && <Box className="touch-editor-grid__guide" data-axis="x" data-side={edgeX.side} style={{ left: `${edgeX.at}px` }} />}
      {edgeY && <Box className="touch-editor-grid__guide" data-axis="y" data-side={edgeY.side} style={{ top: `${edgeY.at}px` }} />}
    </Box>
  );
};

export { TouchEditorGrid };

/* @layer renderer-app @kind component */
import type { CSSProperties } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { SNAP_CELL_SIZE } from '@rotp/input-mapping';
import './TouchEditorGrid.css';
import type { TouchEditorGridProps } from './TouchEditorGrid.type';

const TouchEditorGrid = ({ box, snap }: TouchEditorGridProps) => {
  if (!snap.enabled) return null;
  const cellPx = SNAP_CELL_SIZE[snap.cell] * Math.min(box.width, box.height);
  return <Box className="touch-editor-grid" style={{ '--touch-grid-cell': `${cellPx}px` } as CSSProperties} aria-hidden="true" />;
};

export { TouchEditorGrid };

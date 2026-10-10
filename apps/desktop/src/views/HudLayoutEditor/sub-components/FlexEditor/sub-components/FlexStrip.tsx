/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { weightsOf } from '../behavior/weights-of';
import './FlexStrip.css';
import type { CSSProperties } from 'react';
import type { FlexStripProps } from './FlexStrip.type';

const idOf = (index: number): string => `hud-flex-cell-${index}`;

const FlexStrip = (props: FlexStripProps) => {
  const { cells, direction, wrap, cursor, label, onCellDown, onKeyDown } = props;
  const weights = weightsOf(cells);

  return (
    <Box
      className="hud-flex-strip"
      role="listbox"
      aria-multiselectable
      tabIndex={0}
      aria-label={label}
      aria-activedescendant={cells.length > 0 ? idOf(cursor) : undefined}
      data-flow={direction}
      data-wrap={wrap ? 'true' : undefined}
      onKeyDown={onKeyDown}
    >
      {cells.length === 0 && (
        <Text className="hud-flex-strip__empty">no children yet</Text>
      )}
      {cells.map((cell, index) => (
        <Box
          key={cell.id}
          id={idOf(index)}
          className="hud-flex-strip__cell"
          role="option"
          aria-selected={cell.selected}
          data-index={index}
          data-state={cell.selected ? 'selected' : 'idle'}
          data-cursor={cursor === index ? 'true' : undefined}
          title={`${cell.id} is item ${index + 1}`}
          style={{ '--hud-flex-weight': weights[index] } as CSSProperties}
          onPointerDown={(event) => onCellDown(index, event)}
        >
          <Text className="hud-flex-strip__label">{cell.id}</Text>
        </Box>
      ))}
    </Box>
  );
};

export { FlexStrip };
export type { FlexCell, FlexStripProps } from './FlexStrip.type';

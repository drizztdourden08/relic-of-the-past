/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { StageSelectionProps } from './StageSelection.type';

const StageSelection = (props: StageSelectionProps) => {
  const { nodes, scale, selectedId, onSelect } = props;

  const pick = (event: ReactPointerEvent, id: string): void => {
    event.stopPropagation();
    onSelect(id);
  };

  return (
    <Box className="hud-stage__picks">
      {nodes.map((placed) => {
        const selected = placed.id === selectedId;
        const style = {
          left: placed.rect.x * scale,
          top: placed.rect.y * scale,
          width: Math.max(1, placed.rect.w * scale),
          height: Math.max(1, placed.rect.h * scale),
        };
        return (
          <Box
            key={placed.id}
            className={`hud-stage__pick${selected ? ' is-selected' : ''}${placed.node.kind === 'container' ? ' is-container' : ''}`}
            data-node-id={placed.id}
            style={style}
            onPointerDown={(event) => pick(event, placed.id)}
          >
            {selected && (
              <Text className="hud-stage__measured">{Math.round(placed.rect.w)}×{Math.round(placed.rect.h)}</Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export { StageSelection };
export type { StageSelectionProps } from './StageSelection.type';

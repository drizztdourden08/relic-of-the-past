/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box, Text, Image } from '@drizztdourden08/tessera/primitives';
import { getButtonIconUrl } from '@app/input/button-icons/get-button-icon-url';
import { resolveLiveControlState } from '@rotp/input-mapping';
import type { ControllerButtonGridProps } from './ControllerCardHeader.type';

const ControllerButtonGrid = ({ resolvedDevice, state }: ControllerButtonGridProps) => {
  const gridControls = useMemo(() => [
    ...resolvedDevice.controls.filter((c) => c.kind === 'button'),
    ...resolvedDevice.controls.filter((c) => c.kind === 'axis' && c.category === 'trigger'),
  ], [resolvedDevice.controls]);

  return (
    <Box className="input-cal__btn-grid">
      {gridControls.map((control) => {
        const { pressed } = resolveLiveControlState(control, state.buttons, state.axes);
        const iconUrl = getButtonIconUrl(control.icon);
        return (
          <Box
            key={control.position}
            className={`input-cal__btn-cell ${pressed ? 'input-cal__btn-cell--pressed' : ''}`}
            title={`${control.label} (${control.position})`}
          >
            {iconUrl ? (
              <Image src={iconUrl} alt={control.label} draggable={false} />
            ) : (
              <Text className="input-cal__btn-fallback">{control.label}</Text>
            )}
            <Text className="input-cal__btn-cell-label">{control.label}</Text>
          </Box>
        );
      })}
    </Box>
  );
};

export { ControllerButtonGrid };

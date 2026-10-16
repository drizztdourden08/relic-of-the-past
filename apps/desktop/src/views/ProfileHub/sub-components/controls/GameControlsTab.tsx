/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { SnesBindingRow } from './SnesBindingRow';
import { BindingListHeader } from './BindingListHeader';
import type { CtrlProps } from './controls.type';

const GameControlsTab = ({ ctrl }: CtrlProps) => {
  return (
    <Box
      className={`controls-settings__bindings ${ctrl.dragOverBindings ? 'controls-settings__bindings--drag-over' : ''}`}
      onDragOver={ctrl.handleDragOver}
      onDragLeave={ctrl.handleDragLeave}
      onDrop={ctrl.handleDrop}
    >
      <Box className="controls-settings__binding-list">
        <BindingListHeader middleLabel="SNES" />
        {ctrl.displayMappings.map((mapping) => (
          <SnesBindingRow
            key={mapping.snesButton}
            snesButton={mapping.snesButton}
            binding={mapping.binding}
            bindingIcon={mapping.icon}
            deviceIconUrl={mapping.deviceIconUrl}
            onRebind={ctrl.handleSnesRebind}
            onClear={ctrl.handleSnesClear}
          />
        ))}
      </Box>
    </Box>
  );
};

export { GameControlsTab };

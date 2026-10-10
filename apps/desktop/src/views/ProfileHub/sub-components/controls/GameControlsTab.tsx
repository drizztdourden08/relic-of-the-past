/* @layer renderer-components @kind component */
import { Box, Text, Image } from '@drizztdourden08/tessera/primitives';
import { SnesBindingRow } from './SnesBindingRow';
import { BindingListHeader } from './BindingListHeader';
import { CoreBindingsGroup } from './CoreBindingsGroup';
import { HapticsToggle } from './HapticsToggle';
import type { CtrlProps } from './controls.type';
import './GameControlsTab.css';

const GameControlsTab = ({ ctrl }: CtrlProps) => {
  return (
    <>
      <Box
        className={`controls-settings__bindings ${ctrl.dragOverBindings ? 'controls-settings__bindings--drag-over' : ''}`}
        onDragOver={ctrl.handleDragOver}
        onDragLeave={ctrl.handleDragLeave}
        onDrop={ctrl.handleDrop}
      >
        <Box className="controls-settings__section-header-row">
          <Box className="controls-settings__section-header">Button Mappings</Box>
          <HapticsToggle enabled={ctrl.hapticsEnabled} onChange={ctrl.setHapticsEnabled} />
        </Box>
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
          <CoreBindingsGroup core={ctrl.coreBindings} icons={ctrl.coreIcons} onRebind={ctrl.handleCoreRebind} />
        </Box>
      </Box>

      <Box className="controls-settings__used-inputs">
        <Box className="controls-settings__used-inputs-header">Required Inputs</Box>
        <Box className="controls-settings__used-inputs-list">
          {ctrl.requiredInputs.map((input, idx) => (
            <Box key={`${input.type}-${idx}`} className="controls-settings__used-input">
              <Box className={`controls-settings__used-input-dot ${input.connected ? 'controls-settings__used-input-dot--active' : 'controls-settings__used-input-dot--disconnected'}`} />
              <Image src={input.iconSrc} alt={input.label} className="controls-settings__used-input-icon" />
              <Text className={input.connected ? '' : 'controls-settings__used-input-label--dim'}>{input.label}</Text>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
};

export { GameControlsTab };

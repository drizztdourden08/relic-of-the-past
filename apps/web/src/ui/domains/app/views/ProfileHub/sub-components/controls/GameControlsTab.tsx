/* @layer renderer-components @kind component */
/**
 * GameControlsTab is the classic per-button mapping list.
 *
 * Carries the core verbs too: the four menu verbs drive the pause menu under
 * the classic scheme just as they do under the modern one, so they are bound
 * here instead of only on a tab a classic player never opens.
 */
import { SNES_ACTION_LABELS, SNES_BUTTON_LABELS } from '@shared/types/controls';
import { getSnesIconUrl } from '@app/lib/input/button-icons';
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import { Image } from '../../../../../../design-system/primitives/Image';
import { BindingRow } from './BindingRow';
import { BindingListHeader } from './BindingListHeader';
import { CoreBindingsGroup } from './CoreBindingsGroup';
import { HapticsToggle } from './HapticsToggle';
import type { useControlsSettings } from '../useControlsSettings';

type Ctrl = ReturnType<typeof useControlsSettings>;

const GameControlsTab = ({ ctrl }: { ctrl: Ctrl }) => {
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
            <BindingRow
              key={mapping.snesButton}
              actionLabel={SNES_ACTION_LABELS[mapping.snesButton]}
              middleLabel={SNES_BUTTON_LABELS[mapping.snesButton]}
              middleIconUrl={getSnesIconUrl(mapping.snesButton)}
              binding={mapping.binding}
              bindingIcon={mapping.icon}
              deviceIconUrl={mapping.deviceIconUrl}
              onRebind={() => ctrl.handleSnesRebind(mapping.snesButton)}
              onClear={() => ctrl.handleSnesClear(mapping.snesButton)}
            />
          ))}
          <CoreBindingsGroup core={ctrl.coreBindings} icons={ctrl.coreIcons} onRebind={ctrl.handleCoreRebind} />
        </Box>
      </Box>

      {/* Used inputs summary */}
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

/* @layer renderer-components @kind component */
/** ControlsSettings center column: tabbed binding editor (controls/enhanced/shortcuts/cheats). */
import {
  SNES_ACTION_LABELS,
  SNES_BUTTON_LABELS,
  SHORTCUT_ACTIONS,
  CHEAT_ACTIONS,
  FUNCTION_ACTION_LABELS,
} from '@shared/types/controls';
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import { Image } from '../../../../../../design-system/primitives/Image';
import { TabBar } from '../../../../../../design-system/primitives/TabBar';
import { BindingRow } from './BindingRow';
import { HapticsToggle } from './HapticsToggle';
import { getSnesIconUrl, getButtonIconUrl } from '@app/lib/input/button-icons';
import type { useControlsSettings } from '../useControlsSettings';

type Ctrl = ReturnType<typeof useControlsSettings>;
type ControlsTab = 'controls' | 'enhanced' | 'shortcuts' | 'cheats';

const CONTROLS_TABS = [
  { id: 'controls', label: 'Game Controls' },
  { id: 'shortcuts', label: 'Shortcuts & Functions' },
  { id: 'cheats', label: 'Cheats' },
];

const ControlsMain = ({ ctrl }: { ctrl: Ctrl }) => {
  return (
    <Box className="controls-settings__main">
      {/* Tab bar */}
      <TabBar tabs={CONTROLS_TABS} activeTab={ctrl.activeTab} onTabChange={(id) => ctrl.setActiveTab(id as ControlsTab)} />

      {/* Tab content */}
      {ctrl.activeTab === 'controls' && (
        <>
          <Box
            className={`controls-settings__bindings ${ctrl.dragOverBindings ? 'controls-settings__bindings--drag-over' : ''}`}
            onDragOver={ctrl.handleDragOver}
            onDragLeave={ctrl.handleDragLeave}
            onDrop={ctrl.handleDrop}
          >
            <Box className="controls-settings__section-header-row">
              <Box className="controls-settings__section-header">
                Button Mappings
              </Box>
              <HapticsToggle enabled={ctrl.hapticsEnabled} onChange={ctrl.setHapticsEnabled} />
            </Box>
            <Box className="controls-settings__binding-list">
              <Box className="binding-row binding-row--header">
                <Text className="binding-row__action-label">Action</Text>
                <Box className="binding-row__icon-slot" />
                <Text className="binding-row__snes-label">SNES</Text>
                <Box className="binding-row__icon-slot" />
                <Text className="binding-row__binding-label">Binding</Text>
              </Box>
              {ctrl.displayMappings.map(mapping => (
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
      )}

      {ctrl.activeTab === 'shortcuts' && (
        <Box className="controls-settings__bindings">
          <Box className="controls-settings__section-header">Keyboard Shortcuts</Box>
          <Box className="controls-settings__binding-list">
            <Box className="binding-row binding-row--header">
              <Text className="binding-row__action-label">Action</Text>
              <Box className="binding-row__icon-slot" />
              <Text className="binding-row__snes-label" />
              <Box className="binding-row__icon-slot" />
              <Text className="binding-row__binding-label">Binding</Text>
            </Box>
            {/* Reserved system shortcut */}
            <Box className="binding-row binding-row--reserved" title="Reserved — cannot be rebound">
              <Text className="binding-row__action-label">Open Menu</Text>
              <Box className="binding-row__icon-slot" />
              <Text className="binding-row__snes-label" />
              <Box className="binding-row__icon-slot">
                <Image src={getButtonIconUrl('kb-escape')!} alt="Esc" className="binding-row__icon-img" />
              </Box>
              <Text className="binding-row__binding-label">Esc</Text>
            </Box>
            {ctrl.displayFunctionMappings
              .filter(m => (SHORTCUT_ACTIONS as readonly string[]).includes(m.action))
              .map(mapping => (
                <BindingRow
                  key={mapping.action}
                  actionLabel={FUNCTION_ACTION_LABELS[mapping.action]}
                  binding={mapping.binding}
                  bindingIcon={mapping.icon}
                  deviceIconUrl={mapping.deviceIconUrl}
                  onRebind={() => ctrl.handleFunctionRebind(mapping.action)}
                  onClear={() => ctrl.handleFunctionClear(mapping.action)}
                />
              ))}
          </Box>
        </Box>
      )}

      {ctrl.activeTab === 'cheats' && (
        <Box className="controls-settings__bindings">
          <Box className="controls-settings__section-header">Cheat Bindings</Box>
          <Box className="controls-settings__binding-list">
            <Box className="binding-row binding-row--header">
              <Text className="binding-row__action-label">Action</Text>
              <Box className="binding-row__icon-slot" />
              <Text className="binding-row__snes-label" />
              <Box className="binding-row__icon-slot" />
              <Text className="binding-row__binding-label">Binding</Text>
            </Box>
            {ctrl.displayFunctionMappings
              .filter(m => (CHEAT_ACTIONS as readonly string[]).includes(m.action))
              .map(mapping => (
                <BindingRow
                  key={mapping.action}
                  actionLabel={FUNCTION_ACTION_LABELS[mapping.action]}
                  binding={mapping.binding}
                  bindingIcon={mapping.icon}
                  deviceIconUrl={mapping.deviceIconUrl}
                  onRebind={() => ctrl.handleFunctionRebind(mapping.action)}
                  onClear={() => ctrl.handleFunctionClear(mapping.action)}
                />
              ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export { ControlsMain };

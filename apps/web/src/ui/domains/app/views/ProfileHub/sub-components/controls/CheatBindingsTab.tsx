/* @layer renderer-components @kind component */
/** Cheats tab: the cheat bindings, scrimmed while the master cheats toggle is off. */
import { CHEAT_ACTIONS, FUNCTION_ACTION_LABELS } from '@shared/types/controls';
import { Box } from '../../../../../../design-system/primitives/Box';
import { DisabledOverlay, DISABLED_SETTING_MESSAGES } from '../../../../../../design-system/composites/DisabledOverlay';
import { BindingRow } from './BindingRow';
import { BindingListHeader } from './BindingListHeader';
import type { useControlsSettings } from '../useControlsSettings';

type Ctrl = ReturnType<typeof useControlsSettings>;

interface CheatBindingsTabProps {
  ctrl: Ctrl;
  /** Whether the cheats master toggle is on. The bindings below no-op while it's off. */
  cheatsEnabled: boolean;
  /** Deep-links to the Enable Cheats setting. */
  onOpenCheatsSettings: () => void;
}

const CheatBindingsTab = ({ ctrl, cheatsEnabled, onOpenCheatsSettings }: CheatBindingsTabProps) => {
  return (
    <Box className="controls-settings__bindings">
      <Box className="controls-settings__section-header">Cheat Bindings</Box>
      {/* `contained`: controls-settings__bindings clips overflow and the header sits flush
       *  above with no gap, so the default overhang would bleed onto it or get clipped. */}
      <DisabledOverlay
        active={!cheatsEnabled}
        message={DISABLED_SETTING_MESSAGES.cheatsEnabled}
        contained
        onOpenSettings={onOpenCheatsSettings}
      >
        <Box className="controls-settings__binding-list">
          <BindingListHeader />
          {ctrl.displayFunctionMappings
            .filter((m) => (CHEAT_ACTIONS as readonly string[]).includes(m.action))
            .map((mapping) => (
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
      </DisabledOverlay>
    </Box>
  );
};

export { CheatBindingsTab };

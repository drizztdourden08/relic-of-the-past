/* @layer renderer-components @kind component */
import { CHEAT_ACTIONS } from '@shared/types/controls/functions/functions.constants';
import { Box } from '@drizztdourden08/tessera/primitives';
import { DisabledOverlay } from '@drizztdourden08/tessera/composites';
import { DISABLED_SETTING_MESSAGES } from '@domains/app/disabled-setting-messages.constants';
import { FunctionBindingRow } from './FunctionBindingRow';
import { BindingListHeader } from './BindingListHeader';
import type { CheatBindingsTabProps } from './controls.type';

const CheatBindingsTab = ({ ctrl, cheatsEnabled, onOpenCheatsSettings }: CheatBindingsTabProps) => {
  return (
    <Box className="controls-settings__bindings">
      <Box className="controls-settings__section-header">Cheat Bindings</Box>
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
              <FunctionBindingRow
                key={mapping.action}
                mapping={mapping}
                onRebind={ctrl.handleFunctionRebind}
                onClear={ctrl.handleFunctionClear}
              />
            ))}
        </Box>
      </DisabledOverlay>
    </Box>
  );
};

export { CheatBindingsTab };

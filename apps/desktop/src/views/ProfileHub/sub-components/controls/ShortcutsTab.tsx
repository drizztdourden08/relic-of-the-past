/* @layer renderer-components @kind component */
import { SHORTCUT_ACTIONS } from '@rotp/features';
import { getButtonIconUrl } from '@app/input/button-icons/get-button-icon-url';
import { Box, Text, Image } from '@drizztdourden08/tessera/primitives';
import { FunctionBindingRow } from './FunctionBindingRow';
import { BindingListHeader } from './BindingListHeader';
import type { CtrlProps } from './controls.type';

const ShortcutsTab = ({ ctrl }: CtrlProps) => {
  return (
    <Box className="controls-settings__bindings">
      <Box className="controls-settings__section-header">Keyboard Shortcuts</Box>
      <Box className="controls-settings__binding-list">
        <BindingListHeader />
        <Box className="binding-row binding-row--reserved" title="Reserved, cannot be rebound">
          <Text className="binding-row__action-label">Open Menu</Text>
          <Box className="binding-row__icon-slot" />
          <Text className="binding-row__snes-label" />
          <Box className="binding-row__icon-slot">
            <Image src={getButtonIconUrl('kb-escape') ?? undefined} alt="Esc" className="binding-row__icon-img" />
          </Box>
          <Text className="binding-row__binding-label">Esc</Text>
        </Box>
        {ctrl.displayFunctionMappings
          .filter((m) => (SHORTCUT_ACTIONS as readonly string[]).includes(m.action))
          .map((mapping) => (
            <FunctionBindingRow
              key={mapping.action}
              mapping={mapping}
              onRebind={ctrl.handleFunctionRebind}
              onClear={ctrl.handleFunctionClear}
            />
          ))}
      </Box>
    </Box>
  );
};

export { ShortcutsTab };

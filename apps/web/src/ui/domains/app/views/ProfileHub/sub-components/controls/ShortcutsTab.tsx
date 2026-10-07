/* @layer renderer-components @kind component */
/** Shortcuts & Functions tab: the app-level shortcut bindings, plus the one reserved key. */
import { SHORTCUT_ACTIONS, FUNCTION_ACTION_LABELS } from '@shared/types/controls';
import { getButtonIconUrl } from '@app/lib/input/button-icons';
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import { Image } from '../../../../../../design-system/primitives/Image';
import { BindingRow } from './BindingRow';
import { BindingListHeader } from './BindingListHeader';
import type { useControlsSettings } from '../useControlsSettings';

type Ctrl = ReturnType<typeof useControlsSettings>;

const ShortcutsTab = ({ ctrl }: { ctrl: Ctrl }) => {
  return (
    <Box className="controls-settings__bindings">
      <Box className="controls-settings__section-header">Keyboard Shortcuts</Box>
      <Box className="controls-settings__binding-list">
        <BindingListHeader />
        {/* Reserved system shortcut */}
        <Box className="binding-row binding-row--reserved" title="Reserved, cannot be rebound">
          <Text className="binding-row__action-label">Open Menu</Text>
          <Box className="binding-row__icon-slot" />
          <Text className="binding-row__snes-label" />
          <Box className="binding-row__icon-slot">
            <Image src={getButtonIconUrl('kb-escape')!} alt="Esc" className="binding-row__icon-img" />
          </Box>
          <Text className="binding-row__binding-label">Esc</Text>
        </Box>
        {ctrl.displayFunctionMappings
          .filter((m) => (SHORTCUT_ACTIONS as readonly string[]).includes(m.action))
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
    </Box>
  );
};

export { ShortcutsTab };

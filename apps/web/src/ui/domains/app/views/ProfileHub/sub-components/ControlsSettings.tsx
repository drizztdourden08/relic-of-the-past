/* @layer renderer-components @kind component */
/**
 * Full input mapping UI.
 *
 * Layout:  sidebar (profiles) | main (tabbed binding editor) | devices column,
 * plus rebind-listener + confirm-preset/delete modals. Logic lives in
 * useControlsSettings; columns live in ./controls/*.
 */

import type { GameSettings } from '@shared/types/settings';
import type { ListeningTarget } from './controls-settings/useBindingState';
import { SNES_BUTTON_LABELS, FUNCTION_ACTION_LABELS } from '@shared/types/controls';
import { openSettingsTarget } from '@app/stores/search-store';
import { BindingListener } from './controls/BindingListener';
import { CORE_VERB_LABELS } from './controls/core-verbs';
import { ControlsSidebar } from './controls/ControlsSidebar';
import { ControlsMain } from './controls/ControlsMain';
import { ControlsDevices } from './controls/ControlsDevices';
import { Dialog } from '../../../../../design-system/composites/Dialog/Dialog';
import { Box } from '../../../../../design-system/primitives/Box';
import { useControlsSettings } from './useControlsSettings';
import './ControlsSettings.css';

interface ControlsSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  profileId: string;
}

/** What the capture modal says it is listening for. */
const listeningLabel = (target: ListeningTarget): string => {
  switch (target.type) {
    case 'snes': return SNES_BUTTON_LABELS[target.button];
    case 'function': return FUNCTION_ACTION_LABELS[target.action];
    case 'core': return CORE_VERB_LABELS[target.verb];
    case 'slot': return target.slot.label;
  }
};

const ControlsSettings = (props: ControlsSettingsProps) => {
  const { settings, onChange, profileId } = props;
  const ctrl = useControlsSettings({ settings, onChange, profileId });

  return (
    <Box className="controls-settings">
      <ControlsSidebar ctrl={ctrl} />
      <ControlsMain
        ctrl={ctrl}
        cheatsEnabled={settings.cheatsEnabled}
        onOpenCheatsSettings={() => openSettingsTarget('cheatsEnabled')}
        onOpenHudStyle={() => openSettingsTarget('hudStyle')}
      />
      <ControlsDevices ctrl={ctrl} />

      {/* Rebind listener modal */}
      {ctrl.listeningFor && (
        <BindingListener
          actionLabel={listeningLabel(ctrl.listeningFor)}
          onCapture={ctrl.handleCapture}
          onCancel={() => ctrl.setListeningFor(null)}
        />
      )}

      {/* Confirm preset dialog */}
      <Dialog
        open={!!ctrl.confirmPreset}
        title="Apply Controller Preset"
        message={`Assign "${ctrl.confirmPreset?.deviceName ?? ''}" to this profile and apply its default mappings? This will overwrite all current bindings.`}
        confirmLabel="Apply"
        cancelLabel="Cancel"
        onConfirm={ctrl.handleApplyPreset}
        onCancel={() => ctrl.setConfirmPreset(null)}
      />

      {/* Delete profile dialog */}
      <Dialog
        open={!!ctrl.deleteTarget}
        title="Delete Input Profile"
        message={`Delete "${ctrl.deleteTarget?.name ?? ''}"? This cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={ctrl.handleDeleteConfirm}
        onCancel={() => ctrl.setDeleteTarget(null)}
      />
    </Box>
  );
};

export { ControlsSettings };

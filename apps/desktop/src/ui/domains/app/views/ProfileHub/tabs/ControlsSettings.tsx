/* @layer renderer-components @kind component */
/**
 * ControlsSettings — full input mapping UI.
 *
 * Layout:  sidebar (profiles) | main (tabbed binding editor) | devices column,
 * plus rebind-listener + confirm-preset/delete modals. Logic lives in
 * useControlsSettings; columns live in ./controls/*.
 */

import type { GameSettings } from '@shared/types/settings';
import { SNES_BUTTON_LABELS, FUNCTION_ACTION_LABELS } from '@shared/types/controls';
import { BindingListener } from './controls/BindingListener';
import { ControlsSidebar } from './controls/ControlsSidebar';
import { ControlsMain } from './controls/ControlsMain';
import { ControlsDevices } from './controls/ControlsDevices';
import { Dialog } from '../../../../../design-system/composites/Dialog/Dialog';
import { useControlsSettings } from './useControlsSettings';
import './ControlsSettings.css';

interface ControlsSettingsProps {
  settings: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  profileId: string;
}

const ControlsSettings = (props: ControlsSettingsProps) => {
  const { settings, onChange, profileId } = props;
  const ctrl = useControlsSettings({ settings, onChange, profileId });

  return (
    <div className="controls-settings">
      <ControlsSidebar ctrl={ctrl} />
      <ControlsMain ctrl={ctrl} />
      <ControlsDevices ctrl={ctrl} />

      {/* Rebind listener modal */}
      {ctrl.listeningFor && (
        <BindingListener
          actionLabel={
            ctrl.listeningFor.type === 'snes'
              ? SNES_BUTTON_LABELS[ctrl.listeningFor.button]
              : FUNCTION_ACTION_LABELS[ctrl.listeningFor.action]
          }
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
    </div>
  );
};

export { ControlsSettings };

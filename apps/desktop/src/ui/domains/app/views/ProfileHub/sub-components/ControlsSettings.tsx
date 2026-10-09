/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { openSettingsTarget } from '@app/stores/search-store';
import { BindingListener } from './controls/BindingListener';
import { ControlsSidebar } from './controls/ControlsSidebar';
import { ControlsMain } from './controls/ControlsMain';
import { ControlsDevices } from './controls/ControlsDevices';
import { Dialog } from '@drizztdourden08/tessera/composites';
import { Box } from '@drizztdourden08/tessera/primitives';
import { useControlsSettings } from './useControlsSettings';
import { listeningLabel } from './controls-settings/listening-label';
import type { ProfileScopedTabProps } from './settings-controls.type';
import './ControlsSettings.css';

const openCheatsSettings = () => openSettingsTarget('cheatsEnabled');
const openHudStyle = () => openSettingsTarget('hudStyle');

const ControlsSettings = (props: ProfileScopedTabProps) => {
  const { settings, onChange, profileId } = props;
  const ctrl = useControlsSettings({ settings, onChange, profileId });
  const { setListeningFor, setConfirmPreset, setDeleteTarget } = ctrl;
  const cancelListening = useCallback(() => setListeningFor(null), [setListeningFor]);
  const cancelPreset = useCallback(() => setConfirmPreset(null), [setConfirmPreset]);
  const cancelDelete = useCallback(() => setDeleteTarget(null), [setDeleteTarget]);

  return (
    <Box className="controls-settings">
      <ControlsSidebar ctrl={ctrl} />
      <ControlsMain
        ctrl={ctrl}
        cheatsEnabled={settings.cheatsEnabled}
        onOpenCheatsSettings={openCheatsSettings}
        onOpenHudStyle={openHudStyle}
      />
      <ControlsDevices ctrl={ctrl} />

      {ctrl.listeningFor && (
        <BindingListener
          actionLabel={listeningLabel(ctrl.listeningFor)}
          onCapture={ctrl.handleCapture}
          onCancel={cancelListening}
        />
      )}

      <Dialog
        open={!!ctrl.confirmPreset}
        title="Apply Controller Preset"
        message={`Assign "${ctrl.confirmPreset?.deviceName ?? ''}" to this profile and apply its default mappings? This will overwrite all current bindings.`}
        confirmLabel="Apply"
        cancelLabel="Cancel"
        onConfirm={ctrl.handleApplyPreset}
        onCancel={cancelPreset}
      />

      <Dialog
        open={!!ctrl.deleteTarget}
        title="Delete Input Profile"
        message={`Delete "${ctrl.deleteTarget?.name ?? ''}"? This cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={ctrl.handleDeleteConfirm}
        onCancel={cancelDelete}
      />
    </Box>
  );
};

export { ControlsSettings };

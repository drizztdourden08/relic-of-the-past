/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { openSetting } from '@app/settings-nav/open-setting';
import { BindingListener } from './controls/BindingListener';
import { ControlsProfiles } from './controls/ControlsProfiles';
import { ControlsMain } from './controls/ControlsMain';
import { ControlsDevices } from './controls/ControlsDevices';
import { Dialog } from '@drizztdourden08/tessera/composites';
import { Flex } from '@drizztdourden08/tessera/primitives';
import { SearchAnchor } from '@drizztdourden08/brock-react';
import { experimentalFeaturesEnabled } from '@rotp/features';
import { useControlsSettings } from './controls-settings';
import { listeningLabel } from './controls-settings/listening-label';
import type { ControlsSettingsProps } from './ControlsSettings.type';
import './ControlsSettings.css';

const openCheatsSettings = () => openSetting('cheatsEnabled');

const ControlsSettings = (props: ControlsSettingsProps) => {
  const { settings, onChange, profileId } = props;
  const ctrl = useControlsSettings({ settings, onChange, profileId });
  const { setListeningFor, setConfirmPreset, setDeleteTarget } = ctrl;
  const cancelListening = useCallback(() => setListeningFor(null), [setListeningFor]);
  const cancelPreset = useCallback(() => setConfirmPreset(null), [setConfirmPreset]);
  const cancelDelete = useCallback(() => setDeleteTarget(null), [setDeleteTarget]);

  return (
    <Flex gap="md" align="stretch" className="controls-settings">
      <SearchAnchor anchor="input-profiles" className="controls-settings__anchor">
        <ControlsProfiles ctrl={ctrl} />
      </SearchAnchor>
      <SearchAnchor anchor="bindings" className="controls-settings__anchor controls-settings__anchor--main">
        <ControlsMain
          ctrl={ctrl}
          experimental={experimentalFeaturesEnabled(settings)}
          cheatsEnabled={settings.cheatsEnabled}
          onOpenCheatsSettings={openCheatsSettings}
        />
      </SearchAnchor>
      <SearchAnchor anchor="devices" className="controls-settings__anchor">
        <ControlsDevices ctrl={ctrl} />
      </SearchAnchor>

      {ctrl.listeningFor && (
        <BindingListener
          actionLabel={listeningLabel(ctrl.listeningFor)}
          onCapture={ctrl.handleCapture}
          onCancel={cancelListening}
        />
      )}

      <Dialog
        open={Boolean(ctrl.confirmPreset)}
        title="Apply Controller Preset"
        message={`Assign "${ctrl.confirmPreset?.deviceName ?? ''}" to this profile and apply its default mappings? This will overwrite all current bindings.`}
        confirmLabel="Apply"
        cancelLabel="Cancel"
        onConfirm={ctrl.handleApplyPreset}
        onCancel={cancelPreset}
      />

      <Dialog
        open={Boolean(ctrl.deleteTarget)}
        title="Delete Input Profile"
        message={`Delete "${ctrl.deleteTarget?.name ?? ''}"? This cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={ctrl.handleDeleteConfirm}
        onCancel={cancelDelete}
      />
    </Flex>
  );
};

export { ControlsSettings };

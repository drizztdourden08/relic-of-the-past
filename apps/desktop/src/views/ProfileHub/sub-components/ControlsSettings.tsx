/* @layer renderer-components @kind component */
import { ControlsSettings as BrockControlsSettings } from '@drizztdourden08/brock-input/renderer';
import { useControlsGame } from './controls-settings/useControlsGame';
import { useGlobalBindings } from './controls-settings/useGlobalBindings';
import { useProfileStore } from './controls-settings/useProfileStore';
import type { ControlsSettingsProps } from './ControlsSettings.type';

const ControlsSettings = ({ settings, onChange, profileId }: ControlsSettingsProps) => {
  const game = useControlsGame({ settings, onChange });
  const profiles = useProfileStore({ settings, onChange, profileId });
  const globalBindings = useGlobalBindings({ settings, onChange });
  return <BrockControlsSettings game={game} profiles={profiles} globalBindings={globalBindings} />;
};

export { ControlsSettings };

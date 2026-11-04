/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { SettingsLayout, composeLockCauses } from '@drizztdourden08/brock-react';
import { DEFAULT_SETTINGS } from '@rotp/game-core';
import onlineSections from '@app/screens/game/extras/online.settings';
import { isSettingDisabled } from '@app/settings-controls/is-setting-disabled';
import { LOCK_CAUSE_PROVIDERS } from '@app/settings-controls/lock-causes';
import { lockOverlay } from '@app/settings-controls/lock-overlay';
import { withOwnRows } from '@app/settings-controls/own-row-sections';
import { renderSettingControl } from '@app/settings-controls/render-setting-control';
import type { OnlineSettingsProps } from './OnlineSettings.type';

const OnlineSettings = (props: OnlineSettingsProps) => {
  const { settings, onChange } = props;
  const sections = useMemo(() => withOwnRows(onlineSections()), []);
  return (
    <SettingsLayout
      sections={sections}
      settings={settings}
      defaults={DEFAULT_SETTINGS}
      onChange={onChange}
      renderControl={renderSettingControl}
      isDisabled={isSettingDisabled}
      lockCauseOf={composeLockCauses(LOCK_CAUSE_PROVIDERS)}
      lockOverlay={lockOverlay}
    />
  );
};

export { OnlineSettings };

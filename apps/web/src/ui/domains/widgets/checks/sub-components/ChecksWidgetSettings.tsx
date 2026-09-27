/* @layer renderer-widgets @kind component */
import { useState } from 'react';
import { Box, Text, Toggle } from '@ds/primitives';
import { useWidgetPref } from '../../../../../hooks/useWidgetPref';
import { CHECKS_WIDGET_ID, NOTIFY_PREF, NOTIFY_WHEN_CLOSED_PREF, STICKY_HEADER_KEY } from '../checks.constants';
import { readSticky } from '../behavior/useStickyHeader';

const ChecksWidgetSettings = () => {
  const [sticky, setSticky] = useState<boolean>(readSticky);
  const [notify, setNotify] = useWidgetPref<boolean>(CHECKS_WIDGET_ID, NOTIFY_PREF, true);
  const [notifyWhenClosed, setNotifyWhenClosed] = useWidgetPref<boolean>(CHECKS_WIDGET_ID, NOTIFY_WHEN_CLOSED_PREF, true);

  const handleChange = (next: boolean) => {
    setSticky(next);
    const value = next ? 'on' : 'off';
    localStorage.setItem(STICKY_HEADER_KEY, value);
    window.dispatchEvent(new StorageEvent('storage', { key: STICKY_HEADER_KEY, newValue: value }));
  };

  return (
    <>
      <Box className="widget-settings__row">
        <Text className="widget-settings__label">Pin header</Text>
        <Toggle
          checked={sticky}
          onChange={handleChange}
          description="Keep the summary and filters in place; scroll the list only."
        />
      </Box>
      <Box className="widget-settings__row">
        <Text className="widget-settings__label">Notifications</Text>
        <Toggle
          checked={notify}
          onChange={setNotify}
          description="A card over the game for each check or event you complete."
        />
      </Box>
      <Box className="widget-settings__row">
        <Text className="widget-settings__label">While closed</Text>
        <Toggle
          checked={notifyWhenClosed}
          onChange={setNotifyWhenClosed}
          disabled={!notify}
          description="Keep notifying while this tracker is closed."
        />
      </Box>
    </>
  );
};

export { ChecksWidgetSettings };

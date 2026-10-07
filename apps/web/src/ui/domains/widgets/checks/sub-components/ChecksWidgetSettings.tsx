/* @layer renderer-widgets @kind component */
import { useState } from 'react';
import { Box, Text, Toggle } from '@ds/primitives';
import { STICKY_HEADER_KEY } from '../checks.constants';
import { readSticky } from '../behavior/useStickyHeader';

const ChecksWidgetSettings = () => {
  const [sticky, setSticky] = useState<boolean>(readSticky);

  const handleChange = (next: boolean) => {
    setSticky(next);
    const value = next ? 'on' : 'off';
    localStorage.setItem(STICKY_HEADER_KEY, value);
    window.dispatchEvent(new StorageEvent('storage', { key: STICKY_HEADER_KEY, newValue: value }));
  };

  return (
    <Box className="widget-settings__row">
      <Text className="widget-settings__label">Pin header</Text>
      <Toggle
        checked={sticky}
        onChange={handleChange}
        description="Keep the summary and filters in place; scroll the list only."
      />
    </Box>
  );
};

export { ChecksWidgetSettings };

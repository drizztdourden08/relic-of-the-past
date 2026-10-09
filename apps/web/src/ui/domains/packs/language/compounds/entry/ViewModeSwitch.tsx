/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box, SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { VIEW_MODE_OPTIONS } from './entry.constants';
import type { ViewModeSwitchProps } from './entry.type';
import './ViewModeSwitch.css';

const ViewModeSwitch = (props: ViewModeSwitchProps) => {
  const { value, modes, onChange } = props;
  const options = useMemo(
    () => (modes ? VIEW_MODE_OPTIONS.filter((option) => modes.includes(option.value)) : VIEW_MODE_OPTIONS),
    [modes],
  );

  return (
    <Box className="view-mode-switch">
      <SegmentedControl options={options} value={value} onChange={onChange} />
    </Box>
  );
};

export { ViewModeSwitch };

/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box } from '@ds/primitives';
import { PopoverShell } from './PopoverShell';
import { PresetChoice } from './PresetChoice';
import type { PresetPopoverProps } from './PresetPopover.type';
import './PresetPopover.css';

const PresetPopover = (props: PresetPopoverProps) => {
  const { label, code, presets, onInsert } = props;

  const handlePick = useCallback((param: number) => {
    onInsert([{ t: 'cmd', name: code, param }]);
  }, [code, onInsert]);

  return (
    <PopoverShell label={label} keepFocus>
      <Box className="preset-popover__list">
        {presets.map((preset) => (
          <PresetChoice key={preset.param} preset={preset} onPick={handlePick} />
        ))}
      </Box>
    </PopoverShell>
  );
};

export { PresetPopover };

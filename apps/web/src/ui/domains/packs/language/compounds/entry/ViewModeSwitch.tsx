/* @layer renderer-components @kind component */
/**
 * The three ways to look at one open entry.
 *
 * They are three ANSWERS to three different questions, which is why they are a
 * switch and not a stack: reading asks what the line says, editing asks what it
 * is made of, previewing asks what the player will see. Showing all three at
 * once would triple the height of every open row and answer none of them well.
 */
import { useMemo } from 'react';
import { Box, SegmentedControl } from '@ds/primitives';
import type { SegmentOption } from '@ds/primitives';
import type { EntryViewMode } from '../../behavior/useEntryView';
import './ViewModeSwitch.css';

type ViewModeSwitchProps = {
  value: EntryViewMode;
  /** The views on offer; every one when absent. A read-only list leaves out editing. */
  modes?: readonly EntryViewMode[];
  onChange: (mode: EntryViewMode) => void;
};

const OPTIONS: SegmentOption<EntryViewMode>[] = [
  { value: 'read', label: 'Read' },
  { value: 'edit', label: 'Edit' },
  { value: 'preview', label: 'Preview' },
];

const ViewModeSwitch = (props: ViewModeSwitchProps) => {
  const { value, modes, onChange } = props;
  const options = useMemo(
    () => (modes ? OPTIONS.filter((option) => modes.includes(option.value)) : OPTIONS),
    [modes],
  );

  return (
    <Box className="view-mode-switch">
      <SegmentedControl options={options} value={value} onChange={onChange} />
    </Box>
  );
};

export { ViewModeSwitch };
export type { ViewModeSwitchProps };

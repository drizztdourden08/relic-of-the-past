/* @layer renderer-components @kind component */
/**
 * A value list of four words, for a code whose parameter is a number nobody
 * should have to reason about.
 *
 * The same card serves the pause and the text speed: both are one code taking
 * one parameter, and the only difference between them is which words stand for
 * which values. Holding only buttons, it keeps the caret alive in the text so
 * the value lands where the author was typing.
 */
import { useCallback } from 'react';
import { Box } from '@ds/primitives';
import { PopoverShell } from './PopoverShell';
import { PresetChoice } from './PresetChoice';
import type { Token } from '@shared/game/language';
import type { Preset } from './presets';
import './PresetPopover.css';

type PresetPopoverProps = {
  label: string;
  /** The catalog name of the code being given a value. */
  code: string;
  presets: Preset[];
  onInsert: (tokens: Token[]) => void;
};

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
export type { PresetPopoverProps };

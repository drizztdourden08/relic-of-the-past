/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import variableIcon from '@iconify-icons/lucide/variable';
import { ToolbarButton } from './ToolbarButton';
import { GLYPH_ICON } from './icon-for-token';
import { buildGlyphItems } from './toolbar-model';
import {
  GlyphPopover, PAUSE_CODE, pausePresetsFor, PresetPopover, SPEED_CODE, speedPresetsFor,
  VariablePopover,
} from './popovers';
import {
  GLYPH, GLYPH_LABEL, PAUSE, PAUSE_ICON, PAUSE_LABEL, SPEED, SPEED_ICON, SPEED_LABEL, VARIABLE, VARIABLE_LABEL,
} from './ToolbarInserts.constants';
import type { ToolbarInsertsProps } from './ToolbarInserts.type';

const ToolbarInserts = (props: ToolbarInsertsProps) => {
  const { cfg, variables, font, disabled, open, onPress, onInsert } = props;

  const pausePresets = useMemo(() => pausePresetsFor(cfg), [cfg]);
  const speedPresets = useMemo(() => speedPresetsFor(cfg), [cfg]);
  const glyphs = useMemo(() => buildGlyphItems(cfg), [cfg]);

  return (
    <>
      <ToolbarButton
        id={VARIABLE}
        icon={variableIcon}
        label={VARIABLE_LABEL}
        disabled={disabled}
        open={open === VARIABLE}
        popover={<VariablePopover label={VARIABLE_LABEL} variables={variables} onInsert={onInsert} />}
        onPress={onPress}
      />
      <ToolbarButton
        id={PAUSE}
        icon={PAUSE_ICON}
        label={PAUSE_LABEL}
        disabled={disabled || pausePresets.length === 0}
        open={open === PAUSE}
        popover={(
          <PresetPopover
            label={PAUSE_LABEL}
            code={PAUSE_CODE}
            presets={pausePresets}
            onInsert={onInsert}
          />
        )}
        onPress={onPress}
      />
      <ToolbarButton
        id={SPEED}
        icon={SPEED_ICON}
        label={SPEED_LABEL}
        disabled={disabled || speedPresets.length === 0}
        open={open === SPEED}
        popover={(
          <PresetPopover
            label={SPEED_LABEL}
            code={SPEED_CODE}
            presets={speedPresets}
            onInsert={onInsert}
          />
        )}
        onPress={onPress}
      />
      <ToolbarButton
        id={GLYPH}
        icon={GLYPH_ICON}
        label={GLYPH_LABEL}
        disabled={disabled || glyphs.length === 0}
        open={open === GLYPH}
        popover={<GlyphPopover label={GLYPH_LABEL} items={glyphs} font={font} onInsert={onInsert} />}
        onPress={onPress}
      />
    </>
  );
};

export { ToolbarInserts };

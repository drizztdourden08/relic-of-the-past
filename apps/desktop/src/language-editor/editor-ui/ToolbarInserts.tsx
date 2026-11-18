/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import variableIcon from '@iconify-icons/lucide/variable';
import { useT } from '@drizztdourden08/brock-react';
import { ToolbarButton } from './ToolbarButton';
import { PresetInsertButton } from './PresetInsertButton';
import { GLYPH_ICON } from './icon-for-token';
import { buildGlyphItems } from './toolbar-model';
import {
  GlyphPopover, PAUSE_CODE, pausePresetsFor, SPEED_CODE, speedPresetsFor, VariablePopover,
} from './popovers';
import {
  GLYPH, PAUSE, PAUSE_ICON, SPEED, SPEED_ICON, VARIABLE,
} from './ToolbarInserts.constants';
import type { ToolbarInsertsProps } from './ToolbarInserts.type';

const ToolbarInserts = (props: ToolbarInsertsProps) => {
  const { cfg, variables, font, disabled, open, onPress, onInsert } = props;
  const t = useT();
  const variableLabel = t('language-editor:inserts.variable');
  const pauseLabel = t('language-editor:inserts.pause');
  const speedLabel = t('language-editor:inserts.speed');
  const glyphLabel = t('language-editor:inserts.glyph');

  const pausePresets = useMemo(() => pausePresetsFor(cfg), [cfg]);
  const speedPresets = useMemo(() => speedPresetsFor(cfg), [cfg]);
  const glyphs = useMemo(() => buildGlyphItems(t, cfg), [t, cfg]);

  return (
    <>
      <ToolbarButton
        id={VARIABLE}
        icon={variableIcon}
        label={variableLabel}
        disabled={disabled}
        open={open === VARIABLE}
        popover={<VariablePopover label={variableLabel} variables={variables} onInsert={onInsert} />}
        onPress={onPress}
      />
      <PresetInsertButton
        id={PAUSE}
        icon={PAUSE_ICON}
        label={pauseLabel}
        code={PAUSE_CODE}
        presets={pausePresets}
        disabled={disabled}
        openId={open}
        onPress={onPress}
        onInsert={onInsert}
      />
      <PresetInsertButton
        id={SPEED}
        icon={SPEED_ICON}
        label={speedLabel}
        code={SPEED_CODE}
        presets={speedPresets}
        disabled={disabled}
        openId={open}
        onPress={onPress}
        onInsert={onInsert}
      />
      <ToolbarButton
        id={GLYPH}
        icon={GLYPH_ICON}
        label={glyphLabel}
        disabled={disabled || glyphs.length === 0}
        open={open === GLYPH}
        popover={<GlyphPopover label={glyphLabel} items={glyphs} font={font} onInsert={onInsert} />}
        onPress={onPress}
      />
    </>
  );
};

export { ToolbarInserts };

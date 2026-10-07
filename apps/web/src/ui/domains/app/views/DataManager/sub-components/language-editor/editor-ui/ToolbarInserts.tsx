/* @layer renderer-components @kind component */
/**
 * The four things a translator puts INTO a line that are not typed letters: a
 * variable, a pause, a change of text speed, a picture character.
 *
 * They travel together because they are the same gesture: pick a thing, place it
 * at the caret. Each one opens a card of its own doing exactly that one
 * thing. Nothing is decided here: the variables arrive from the set, the two
 * codes' values from what this language can bake, and the characters from its
 * own alphabet.
 *
 * A button with nothing to offer is disabled instead of opening on an empty
 * card, which happens when an encoder refuses a code outright or an alphabet
 * carries no picture characters at all.
 */
import { useMemo } from 'react';
import variableIcon from '@iconify-icons/lucide/variable';
import { ToolbarButton } from './ToolbarButton';
import { GLYPH_ICON, iconForCodeName } from './icon-for-token';
import { buildGlyphItems } from './toolbar.model';
import {
  GlyphPopover, PAUSE_CODE, pausePresetsFor, PresetPopover, SPEED_CODE, speedPresetsFor,
  VariablePopover,
} from './popovers';
import type { Token, Variable } from '@shared/game/language';
import type { LanguageConfig } from '@shared/asset-extraction/text/data/language-data';
import type { GlyphFont } from './editor-ui.type';

type ToolbarInsertsProps = {
  cfg: LanguageConfig;
  variables: Variable[];
  font: GlyphFont;
  disabled: boolean;
  /** Id of the card the row currently has open, or null. */
  open: string | null;
  onPress: (id: string) => void;
  onInsert: (tokens: Token[]) => void;
};

const VARIABLE = 'variable';
const PAUSE = 'pause';
const SPEED = 'speed';
const GLYPH = 'glyph';

const VARIABLE_LABEL = 'Insert a variable';
const PAUSE_LABEL = 'Insert a pause';
const SPEED_LABEL = 'Insert a text speed';
const GLYPH_LABEL = 'Insert a picture character';

const PAUSE_ICON = iconForCodeName(PAUSE_CODE);
const SPEED_ICON = iconForCodeName(SPEED_CODE);

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
export type { ToolbarInsertsProps };

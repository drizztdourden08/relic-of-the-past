/* @layer renderer-components @kind component */
/**
 * `opacity`, `visible`, `background`, `border`, `radius`, `shadow`, `outline`,
 * `tint`, `clip`, `dim when empty`. This is how a box is PAINTED, never its geometry
 * (that's Size & Box).
 *
 * PHASE 8: THE SECTION IS A LIST OF APPLIED EFFECTS. It was ~1800px of flat
 * scroll with six identical-looking headings, two of which were plain booleans
 * (`Clip children`, `Visible`) and four of which revealed a sub-editor.
 * They were indistinguishable until you flipped one. Background, Border, Outline, Tint
 * and each Shadow are `SubsectionGroup`s now: one header row carrying the
 * enable box, a swatch and the value in words, closed by default. The
 * unconditional rows that are left are visible, opacity, radius, clip and dim
 * when empty, which are not a sub-editor and never were.
 *
 * ONE GROUP OPEN AT A TIME, and this file is where that is enforced, for the
 * same reason `NodeInspector` enforces it for the nine sections: it only works
 * if ONE place owns the set. `openKey` spans the shadow cards too, which is why
 * `ShadowListEditor` takes it instead of tracking its own.
 *
 * NOTHING EXPANDS INLINE WITHOUT COLLAPSING SOMETHING ELSE, so the section's
 * height with everything enabled is one screen plus whichever single group is
 * open. The flat scroll could not have that property at any density.
 */
import { useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Field } from '@ds/primitives/Field';
import { Grid } from '@ds/primitives/Grid';
import { SegmentedControl } from '@ds/primitives/SegmentedControl';
import { Select } from '@ds/primitives/Select';
import { Toggle } from '@ds/primitives/Toggle';
import { DisabledReason } from '../DisabledReason';
import { PaintField } from '../PaintField';
import { ShadowListEditor } from '../ShadowListEditor';
import { SidesField } from '../SidesField';
import { SlotChips } from '../SlotChips';
import { SubsectionGroup } from '../SubsectionGroup';
import { ValueField } from '../ValueField';
import {
  borderSummary, outlineSummary, paintText, shadowListSummary, swatchOf, tintSummary,
} from '../../behavior/appearance-summary';
import type { HudBorder, HudBorderStyle, HudNode, HudRadius, HudTintMode, Value } from '@shared/types/hud';

interface AppearanceSectionProps {
  node: HudNode;
  onPatch: (patch: Partial<HudNode>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
}

const BORDER_STYLES: readonly HudBorderStyle[] = ['solid', 'dashed', 'dotted'];
/** A ring around the ink is drawn as stacked filters. That is cheap at one or two
 *  pixels and expensive past that. See `hud-style.ts`'s own header. */
const MAX_OUTLINE_PX = 2;
/** The CSS `border-radius` shorthand order, kept as initials: a 2-up grid at
 *  the 188px rail gives each label ~88px, which `BOTTOM RIGHT` does not fit on
 *  one line at `--text-xs` once `Field` uppercases and letter-spaces it. */
const CORNERS = ['TL', 'TR', 'BR', 'BL'] as const;

const radiusIsSplit = (r: HudRadius | undefined): r is [Value, Value, Value, Value] => Array.isArray(r);

const AppearanceSection = (props: AppearanceSectionProps) => {
  const { node, onPatch, scope, insideRepeat } = props;
  const style = node.style ?? {};
  const setStyle = (patch: typeof style): void => onPatch({ style: { ...style, ...patch } });

  const [openKey, setOpenKey] = useState<string | null>(null);
  const toggle = (key: string): void => setOpenKey((prev) => (prev === key ? null : key));
  /** Enabling a group opens it: the author asked for it, so show it. */
  const enable = (key: string, on: boolean, patch: typeof style): void => {
    setOpenKey(on ? key : (prev) => (prev === key ? null : prev));
    setStyle(patch);
  };

  const { background, border, outline, tint } = style;
  const split = radiusIsSplit(style.radius);
  const derivedSlot = node.kind === 'element' && node.element.type === 'button'
    && node.element.bind.kind === 'slot' ? node.element.bind.index : null;

  return (
    <Box className="hud-inspect__group">
      <Toggle size="sm" checked={node.visible !== false} label="Visible" onChange={(visible) => onPatch({ visible: visible ? undefined : false })} />
      <ValueField label="opacity" value={node.opacity ?? 1} onChange={(opacity) => onPatch({ opacity: opacity === 1 ? undefined : opacity })} scope={scope} insideRepeat={insideRepeat} min={0.2} max={1} step={0.05} />

      <SubsectionGroup
        title="Background" summary={background === undefined ? 'off' : paintText(background)}
        swatch={swatchOf(background)} open={openKey === 'background'} onToggle={() => toggle('background')}
        enabled={background !== undefined}
        onEnabledChange={(on) => enable('background', on, { background: on ? '#000000' : undefined })}
      >
        {background !== undefined && (
          <PaintField value={background} onChange={(next) => setStyle({ background: next })} scope={scope} insideRepeat={insideRepeat} kinds />
        )}
      </SubsectionGroup>

      <SubsectionGroup
        title="Border" summary={borderSummary(border)} swatch={swatchOf(border?.color)}
        open={openKey === 'border'} onToggle={() => toggle('border')} enabled={border !== undefined}
        onEnabledChange={(on) => enable('border', on, { border: on ? { width: 1, color: '#ffffff' } : undefined })}
      >
        {border && (
          <>
            <ValueField label="width" value={border.width} onChange={(width) => setStyle({ border: { ...border, width } })} scope={scope} insideRepeat={insideRepeat} min={0} />
            <PaintField label="colour" value={border.color} onChange={(color) => setStyle({ border: { ...border, color } })} scope={scope} insideRepeat={insideRepeat} />
            <Field size="sm" label="style">
              <Select size="sm" value={border.style ?? 'solid'} options={BORDER_STYLES.map((v) => ({ value: v, label: v }))} onChange={(v) => setStyle({ border: { ...border, style: v as HudBorderStyle } })} />
            </Field>
            <SidesField label="sides" value={border.sides} onChange={(sides) => setStyle({ border: { ...border, sides } as HudBorder })} />
          </>
        )}
      </SubsectionGroup>

      <SubsectionGroup
        title="Outline" summary={outlineSummary(outline)} swatch={swatchOf(outline?.color)}
        open={openKey === 'outline'} onToggle={() => toggle('outline')} enabled={outline !== undefined}
        onEnabledChange={(on) => enable('outline', on, { outline: on ? { width: 1, color: '#ffffff' } : undefined })}
      >
        {outline && (
          <>
            <ValueField label="width" value={outline.width} onChange={(width) => setStyle({ outline: { ...outline, width } })} scope={scope} insideRepeat={insideRepeat} min={0} max={MAX_OUTLINE_PX} step={0.5} />
            <PaintField label="colour" value={outline.color} onChange={(color) => setStyle({ outline: { ...outline, color } })} scope={scope} insideRepeat={insideRepeat} />
          </>
        )}
      </SubsectionGroup>

      <SubsectionGroup
        title="Tint" summary={tintSummary(tint)} swatch={swatchOf(tint?.color)}
        open={openKey === 'tint'} onToggle={() => toggle('tint')} enabled={tint !== undefined}
        onEnabledChange={(on) => enable('tint', on, { tint: on ? { color: '#ffffff' } : undefined })}
      >
        {tint && (
          <>
            <PaintField label="colour" value={tint.color} onChange={(color) => setStyle({ tint: { ...tint, color } })} scope={scope} insideRepeat={insideRepeat} />
            <Field size="sm" label="mode">
              <Select size="sm" value={tint.mode ?? 'multiply'} options={[{ value: 'multiply', label: 'multiply' }, { value: 'replace', label: 'replace' }]} onChange={(mode) => setStyle({ tint: { ...tint, mode: mode as HudTintMode } })} />
            </Field>
            <ValueField label="amount" value={tint.amount ?? 1} onChange={(amount) => setStyle({ tint: { ...tint, amount } })} scope={scope} insideRepeat={insideRepeat} min={0} max={1} step={0.05} />
          </>
        )}
      </SubsectionGroup>

      <Field size="sm" label={`shadows (${shadowListSummary(style.shadow ?? [])})`}>
        <ShadowListEditor value={style.shadow} onChange={(shadow) => setStyle({ shadow })} scope={scope} insideRepeat={insideRepeat} openKey={openKey} onToggleKey={toggle} />
      </Field>

      <Field size="sm" label="radius">
        <SegmentedControl size="sm" value={split ? 'split' : 'uniform'} options={[{ value: 'uniform', label: 'uniform' }, { value: 'split', label: 'per corner' }]}
          onChange={(v) => onPatch({ style: { ...style, radius: v === 'split' ? [0, 0, 0, 0] : 0 } })} />
      </Field>
      {split ? (
        <Grid columns={2} gap="2xs">
          {CORNERS.map((corner, i) => (
            <ValueField key={corner} label={corner} value={(style.radius as [Value, Value, Value, Value])[i]}
              onChange={(v) => { const next = [...(style.radius as [Value, Value, Value, Value])] as [Value, Value, Value, Value]; next[i] = v; setStyle({ radius: next }); }}
              scope={scope} insideRepeat={insideRepeat} min={0} />
          ))}
        </Grid>
      ) : (
        <ValueField value={(style.radius as Value | undefined) ?? 0} onChange={(radius) => setStyle({ radius })} scope={scope} insideRepeat={insideRepeat} min={0} />
      )}

      <Toggle size="sm" checked={style.clip === true} label="Clip children" onChange={(clip) => setStyle({ clip: clip ? true : undefined })} />

      {derivedSlot === null ? (
        <SlotChips label="dim when empty" value={node.dimWhenEmpty} onChange={(dimWhenEmpty) => onPatch({ dimWhenEmpty })} hint="Dimmed while all are empty." />
      ) : (
        <DisabledReason active reason="Derived from this button's own slot bind. See its Content section.">
          <SlotChips label="dim when empty" value={[derivedSlot]} onChange={() => {}} readOnly />
        </DisabledReason>
      )}
    </Box>
  );
};

export { AppearanceSection };
export type { AppearanceSectionProps };

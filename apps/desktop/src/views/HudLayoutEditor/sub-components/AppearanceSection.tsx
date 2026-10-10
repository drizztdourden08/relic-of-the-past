/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Box, Field, Grid, SegmentedControl, Select, Toggle } from '@drizztdourden08/tessera/primitives';
import { DisabledReason } from './DisabledReason';
import { PaintField } from './PaintField';
import { ShadowListEditor } from './ShadowListEditor';
import { SidesField } from './SidesField';
import { SlotChips } from './SlotChips';
import { SubsectionGroup } from './SubsectionGroup';
import { ValueField } from './ValueField';
import {
  borderSummary, outlineSummary, paintText, shadowListSummary, swatchOf, tintSummary,
} from '@app/hud-layout-editing/appearance-summary';
import type { HudBorder, HudBorderStyle, HudRadius, HudTintMode, Value } from '@rotp/hud';
import { BORDER_STYLES, CORNERS, MAX_OUTLINE_PX } from './AppearanceSection.constants';
import type { AppearanceSectionProps } from './AppearanceSection.type';

const radiusIsSplit = (r: HudRadius | undefined): r is [Value, Value, Value, Value] => Array.isArray(r);

const cornerValue = (radius: readonly [Value, Value, Value, Value], i: number): Value => {
  const value = radius[i];
  if (value === undefined) throw new Error(`corner radius ${i} is out of range`);
  return value;
};

const AppearanceSection = (props: AppearanceSectionProps) => {
  const { node, onPatch, scope, insideRepeat } = props;
  const style = node.style ?? {};
  const setStyle = (patch: typeof style): void => onPatch({ style: { ...style, ...patch } });

  const [openKey, setOpenKey] = useState<string | null>(null);
  const toggle = (key: string): void => setOpenKey((prev) => (prev === key ? null : key));
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
            <SidesField label="sides" value={border.sides} onChange={(sides) => setStyle({ border: { ...border, sides } })} />
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
            <ValueField key={corner} label={corner} value={cornerValue(style.radius as [Value, Value, Value, Value], i)}
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
export type { AppearanceSectionProps } from './AppearanceSection.type';

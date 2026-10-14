/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Box, Field, Toggle } from '@drizztdourden08/tessera/primitives';
import { shadowListSummary } from '@app/hud-layout-editing/appearance-summary';
import { BackgroundGroup } from './BackgroundGroup';
import { BorderGroup } from './BorderGroup';
import { DisabledReason } from './DisabledReason';
import { OutlineGroup } from './OutlineGroup';
import { RadiusFields } from './RadiusFields';
import { ShadowListEditor } from './ShadowListEditor';
import { SlotChips } from './SlotChips';
import { TintGroup } from './TintGroup';
import { ValueField } from './ValueField';
import type { HudBoxStyle } from '@rotp/hud';
import type { AppearanceSectionProps } from './AppearanceSection.type';

const AppearanceSection = (props: AppearanceSectionProps) => {
  const { node, onPatch, scope, insideRepeat } = props;
  const style = node.style ?? {};
  const setStyle = (patch: HudBoxStyle): void => onPatch({ style: { ...style, ...patch } });

  const [openKey, setOpenKey] = useState<string | null>(null);
  const toggle = (key: string): void => setOpenKey((prev) => (prev === key ? null : key));
  const enable = (key: string, on: boolean, patch: HudBoxStyle): void => {
    setOpenKey(on ? key : (prev) => (prev === key ? null : prev));
    setStyle(patch);
  };
  const groupProps = (key: string) => ({
    style, setStyle, scope, insideRepeat, open: openKey === key, onToggle: () => toggle(key),
    onEnable: (on: boolean, patch: HudBoxStyle) => enable(key, on, patch),
  });

  const derivedSlot = node.kind === 'element' && node.element.type === 'button'
    && node.element.bind.kind === 'slot' ? node.element.bind.index : null;

  return (
    <Box className="hud-inspect__group">
      <Toggle size="sm" checked={node.visible !== false} label="Visible" onChange={(visible) => onPatch({ visible: visible ? undefined : false })} />
      <ValueField label="opacity" value={node.opacity ?? 1} onChange={(opacity) => onPatch({ opacity: opacity === 1 ? undefined : opacity })} scope={scope} insideRepeat={insideRepeat} min={0.2} max={1} step={0.05} />

      <BackgroundGroup {...groupProps('background')} />
      <BorderGroup {...groupProps('border')} />
      <OutlineGroup {...groupProps('outline')} />
      <TintGroup {...groupProps('tint')} />

      <Field size="sm" label={`shadows (${shadowListSummary(style.shadow ?? [])})`}>
        <ShadowListEditor value={style.shadow} onChange={(shadow) => setStyle({ shadow })} scope={scope} insideRepeat={insideRepeat} openKey={openKey} onToggleKey={toggle} />
      </Field>

      <RadiusFields boxStyle={style} setStyle={setStyle} scope={scope} insideRepeat={insideRepeat} />

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

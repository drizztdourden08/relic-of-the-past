/* @layer renderer-components @kind component */
import { Button, Flex, Grid, Toggle } from '@drizztdourden08/tessera/primitives';
import { PaintField } from './PaintField';
import { SubsectionGroup } from './SubsectionGroup';
import { ValueField } from './ValueField';
import { shadowSummary, swatchOf } from '../behavior/appearance-summary';
import { BLANK_SHADOW } from './ShadowListEditor.constants';
import type { HudShadow } from '@rotp/hud';
import type { ShadowListEditorProps } from './ShadowListEditor.type';

const ShadowListEditor = (props: ShadowListEditorProps) => {
  const { value, onChange, scope, insideRepeat, openKey, onToggleKey } = props;
  const shadows = value ?? [];

  const setShadow = (i: number, patch: Partial<HudShadow>): void => {
    onChange(shadows.map((s, at) => (at === i ? { ...s, ...patch } : s)));
  };

  const remove = (i: number): void => {
    const next = shadows.filter((_unused, at) => at !== i);
    onChange(next.length > 0 ? next : undefined);
  };

  return (
    <Flex direction="column" gap="2xs" className="hud-shadow-list">
      {shadows.map((shadow, i) => (
        <SubsectionGroup
          key={i}
          title={`Shadow ${i + 1}`}
          summary={shadowSummary(shadow)}
          swatch={swatchOf(shadow.color)}
          open={openKey === `shadow-${i}`}
          onToggle={() => onToggleKey(`shadow-${i}`)}
          action={{ label: `Remove shadow ${i + 1}`, icon: '✕', onClick: () => remove(i) }}
        >
          <Grid columns={2} gap="2xs">
            <ValueField label="x" value={shadow.x} onChange={(x) => setShadow(i, { x })} scope={scope} insideRepeat={insideRepeat} />
            <ValueField label="y" value={shadow.y} onChange={(y) => setShadow(i, { y })} scope={scope} insideRepeat={insideRepeat} />
            <ValueField label="blur" value={shadow.blur} onChange={(blur) => setShadow(i, { blur })} scope={scope} insideRepeat={insideRepeat} min={0} />
            <ValueField label="spread" value={shadow.spread ?? 0} onChange={(spread) => setShadow(i, { spread })} scope={scope} insideRepeat={insideRepeat} />
          </Grid>
          <PaintField label="colour" value={shadow.color} onChange={(color) => setShadow(i, { color })} scope={scope} insideRepeat={insideRepeat} />
          <Toggle size="sm" checked={shadow.inset === true} label="Inset" onChange={(inset) => setShadow(i, { inset: inset ? true : undefined })} />
        </SubsectionGroup>
      ))}
      <Button variant="ghost" size="sm" onClick={() => onChange([...shadows, BLANK_SHADOW])}>+ add shadow</Button>
    </Flex>
  );
};

export { ShadowListEditor };
export type { ShadowListEditorProps } from './ShadowListEditor.type';

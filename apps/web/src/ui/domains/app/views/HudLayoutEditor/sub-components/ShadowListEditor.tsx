/* @layer renderer-components @kind component */
/**
 * `HudBoxStyle.shadow` is a list, because a box may stack more than one (the
 * sheen and the drop, say).
 *
 * WHAT THIS FILE IS AFTER PHASE 8. The review's finding was not that the editor
 * was wrong but that it was invisible: `+ add shadow` sat directly under
 * `radius`, so it read as belonging to it, and an added shadow became five bare
 * rows labelled `x y blur spread` with no card, no index and nothing drawing
 * the result. **Each shadow is now a `SubsectionGroup`** with its own header,
 * collapsed, carrying `0 2 4 #000000` and a chip of its colour, so a stack of
 * three shadows is three lines until you open one.
 *
 * THE OPEN GROUP IS THE SECTION'S, NOT THIS LIST'S. `AppearanceSection` owns a
 * single `openKey` across Background, Border, Outline, Tint and every shadow,
 * which is what "one open at a time" means. Two accordions each tracking their
 * own index would let Border and Shadow 2 be open together and put the section
 * back over one screen.
 */
import { Button } from '@ds/primitives/Button';
import { Flex } from '@ds/primitives/Flex';
import { Grid } from '@ds/primitives/Grid';
import { Toggle } from '@ds/primitives/Toggle';
import { PaintField } from './PaintField';
import { SubsectionGroup } from './SubsectionGroup';
import { ValueField } from './ValueField';
import { shadowSummary, swatchOf } from '../behavior/appearance-summary';
import type { HudShadow } from '@shared/types/hud';

interface ShadowListEditorProps {
  value: HudShadow[] | undefined;
  onChange: (next: HudShadow[] | undefined) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  /** The section's single open group. `shadow-<i>` is this list's namespace. */
  openKey: string | null;
  onToggleKey: (key: string) => void;
}

const BLANK_SHADOW: HudShadow = { x: 0, y: 2, blur: 0, color: '#000000' };

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
export type { ShadowListEditorProps };

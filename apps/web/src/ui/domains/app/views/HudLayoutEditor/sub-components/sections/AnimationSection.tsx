/* @layer renderer-components @kind component */
/**
 * Motion's FIRST block: the animations. Each is a clock the document drives for its
 * own sake, gated by an expression. Phase 10 of
 * `plans/hud-inspector-ux-review.html` rebuilt three things here.
 *
 * AN ANIMATION HAS AN IDENTITY NOW. It was "an unlabelled card distinguished
 * only by its property dropdown, with the delete × loose beside the gate
 * toggle". It is a `SubsectionGroup` (phase 8's, consumed unchanged): the
 * property names it, a one-line summary says what it does while closed
 * (`300ms · loop · gated`), and delete is the header's own action. Three
 * animations on one node are now three readable rows, not three identical
 * cards.
 *
 * THE REFLOW WARNING LANDS ON THE PROPERTY THAT CAUSED IT. §27.3 computes it
 * per node and per property (`validate-motion-warnings.ts` writes the property
 * name into the string), so it is matched to the card that animates that
 * property and rendered under that card's own property control, not as a
 * banner at the top of the section naming a node the author is already looking
 * at. The generic "width and height can reflow siblings" note stays for the
 * case the document-level walk cannot see: an animation just switched to
 * `width` that has not been saved yet.
 *
 * ONE TRANSPORT, NOT ONE PER CARD. Every animation on the surface samples ONE
 * shared clock (§27.7, which is the whole staggering mechanism), so a play
 * button per card would be three buttons driving one thing.
 */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Field } from '@ds/primitives/Field';
import { SegmentedControl } from '@ds/primitives/SegmentedControl';
import { Select } from '@ds/primitives/Select';
import { Text } from '@ds/primitives/Text';
import { Toggle } from '@ds/primitives/Toggle';
import { cyclePosition } from '@shared/hud/engine';
import { resolveValue } from '@shared/hud/data';
import { useMotionPreview } from '../../behavior/motion-preview';
import { EasingPicker } from '../EasingPicker';
import { ExpressionInput } from '../ExpressionInput';
import { KeyframeTrack } from '../KeyframeTrack';
import { MotionTransport } from '../MotionTransport';
import { SubsectionGroup } from '../SubsectionGroup';
import { ValueField } from '../ValueField';
import type { HudAnimatableProperty, HudAnimation, HudAnimationLoop, HudNode } from '@shared/types/hud';
import { MS_STEP } from '../../HudLayoutEditor.constants';

const PROPERTIES: readonly HudAnimatableProperty[] = ['scale', 'opacity', 'x', 'y', 'rotate', 'tint', 'width', 'height'];
const LOOPS: readonly { value: HudAnimationLoop; label: string }[] = [
  { value: 'none', label: 'none' }, { value: 'loop', label: 'loop' }, { value: 'ping-pong', label: 'ping' },
];
const REFLOW = new Set<HudAnimatableProperty>(['width', 'height']);

const BLANK: HudAnimation = { property: 'scale', keyframes: [{ at: 0, value: 1 }, { at: 1, value: 1.1 }], duration: 300, loop: 'none' };

interface AnimationSectionProps {
  node: HudNode;
  onPatch: (patch: Partial<HudNode>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  /** This node's own reflow-warning lines, already filtered by id. */
  warnings: readonly string[];
  /** Which card is expanded, owned by `MotionSection` so one is open at a time. */
  openIndex: number | null;
  onOpen: (index: number | null) => void;
}

const msOf = (animation: HudAnimation, scope: Readonly<Record<string, number>>): { delay: number; duration: number } => ({
  delay: animation.delay === undefined ? 0 : resolveValue(animation.delay, scope),
  duration: resolveValue(animation.duration, scope),
});

const AnimationSection = (props: AnimationSectionProps) => {
  const { node, onPatch, scope, insideRepeat, warnings, openIndex, onOpen } = props;
  const animations = node.animation ?? [];
  const preview = useMotionPreview();
  const spanMs = animations.reduce((longest, a) => {
    const { delay, duration } = msOf(a, scope);
    return Math.max(longest, delay + duration);
  }, 1);

  const setAnimation = (i: number, patch: Partial<HudAnimation>): void => {
    onPatch({ animation: animations.map((a, at) => (at === i ? { ...a, ...patch } : a)) });
  };

  return (
    <Box className="hud-inspect__group">
      {animations.length > 0 && <MotionTransport spanMs={spanMs} />}
      {animations.map((animation, i) => {
        const { delay, duration } = msOf(animation, scope);
        const head = preview?.nowMs == null ? null : cyclePosition(preview.nowMs, delay, duration, animation.loop);
        const reflow = warnings.find((w) => w.includes(`animating '${animation.property}'`));
        return (
          <SubsectionGroup
            key={i}
            title={animation.property}
            summary={`${duration}ms · ${animation.loop}${animation.when !== undefined ? ' · gated' : ''}`}
            open={openIndex === i}
            onToggle={() => onOpen(openIndex === i ? null : i)}
            action={{
              label: `Remove the ${animation.property} animation`,
              icon: '✕',
              // The LAST one deleted clears the field instead of leaving an
              // empty array behind. `[]` and absent read the same to the
              // renderer, but only absent keeps the saved document clean.
              onClick: () => { const rest = animations.filter((_unused, at) => at !== i); onPatch({ animation: rest.length > 0 ? rest : undefined }); },
            }}
          >
            <Field size="sm" label="property">
              <Select
                size="sm"
                value={animation.property}
                options={PROPERTIES.map((p) => ({ value: p, label: p }))}
                onChange={(property) => setAnimation(i, { property: property as HudAnimatableProperty })}
              />
            </Field>
            {reflow !== undefined
              ? <Text className="hud-inspect__warning">⚠ {reflow}</Text>
              : REFLOW.has(animation.property) && (
                <Text className="hud-inspect__warning">⚠ width and height can reflow siblings. The other six properties never can.</Text>
              )}

            <KeyframeTrack
              keyframes={animation.keyframes}
              onChange={(keyframes) => setAnimation(i, { keyframes })}
              scope={scope}
              insideRepeat={insideRepeat}
              easing={animation.easing}
              endLabel={`${duration}ms`}
              head={head}
            />

            <Box className="hud-inspect__row">
              <ValueField label="duration (ms)" value={animation.duration} onChange={(next) => setAnimation(i, { duration: next })} scope={scope} insideRepeat={insideRepeat} min={0} step={MS_STEP} />
              <ValueField label="delay (ms)" value={animation.delay ?? 0} onChange={(next) => setAnimation(i, { delay: next === 0 ? undefined : next })} scope={scope} insideRepeat={insideRepeat} step={MS_STEP} />
            </Box>
            <Field size="sm" label="loop">
              <SegmentedControl size="sm" value={animation.loop} options={[...LOOPS]} onChange={(loop) => setAnimation(i, { loop: loop as HudAnimationLoop })} />
            </Field>
            <EasingPicker label="easing" value={animation.easing} onChange={(easing) => setAnimation(i, { easing })} />

            <Toggle size="sm" checked={animation.when !== undefined} label="only when" onChange={(on) => setAnimation(i, { when: on ? '1' : undefined })} />
            {animation.when !== undefined && (
              <ExpressionInput value={animation.when} onChange={(when) => setAnimation(i, { when })} scope={scope} insideRepeat={insideRepeat} aria-label="Animation gate" />
            )}
          </SubsectionGroup>
        );
      })}
      <Button variant="ghost" size="sm" onClick={() => { onPatch({ animation: [...animations, BLANK] }); onOpen(animations.length); }}>
        + add animation
      </Button>
    </Box>
  );
};

export { AnimationSection };
export type { AnimationSectionProps };

/* @layer renderer-components @kind component */
/**
 * Motion's SECOND block: the value transitions, which ease instead of snapping
 * when a bound value on this node changes.
 *
 * A PROPERTY IS ADDED, NOT INFERRED. The old section listed only the
 * properties something already drove and silently omitted the rest, so an
 * author looking for `opacity` was told nothing at all about why it was not
 * there. Every one of the six is now offered; the ones nothing currently
 * drives are annotated on their own row ("nothing currently drives this"),
 * which is the plan's own answer: "the inference becomes an annotation on the
 * row instead of a silent omission".
 *
 * THE EARLY RETURN IS GONE. "Nothing on this object changes" replaced the
 * WHOLE section with one sentence and took enter/exit down with it, though
 * enter/exit has nothing to do with bound values. It is an `EmptyState` for this list only
 * now, and `EnterExitEditor` is a sibling block that renders regardless.
 *
 * WHERE THIS DEPARTS FROM THE DRAWING, said out loud. The wireframe gives each
 * property row its own duration and easing (120 ms ease-out beside 80 ms
 * linear). `HudTransition` (§27, `hud-motion.ts`) carries ONE `duration` and
 * ONE `easing` for the whole property list, and per-property timing is a model
 * change reaching the type, the validator, `bake-motion.ts`,
 * `resolve-node-transition.ts` and every saved document. That is well outside a
 * panel phase. So the rows are the property list, and duration/easing are one
 * pair beneath them, labelled as applying to all of them instead of drawn per
 * row as if they were independent.
 */
import { Box } from '@ds/primitives/Box';
import { Checkbox } from '@ds/primitives/Checkbox';
import { EmptyState } from '@ds/primitives/EmptyState';
import { Text } from '@ds/primitives/Text';
import { drivenProperties, mergeTransition, TRANSITION_PROPERTIES } from '../../behavior/transition-edits';
import { EasingPicker } from '../EasingPicker';
import { ValueField } from '../ValueField';
import type { HudNode, HudTransitionProperty } from '@shared/types/hud';
import { MS_STEP } from '../../HudLayoutEditor.constants';

interface TransitionsSectionProps {
  node: HudNode;
  onPatch: (patch: Partial<HudNode>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
}

const TransitionsSection = (props: TransitionsSectionProps) => {
  const { node, onPatch, scope, insideRepeat } = props;
  const transition = node.transition;
  const properties = transition?.properties ?? [];
  const driven = drivenProperties(node, insideRepeat === true);

  const set = (patch: Parameters<typeof mergeTransition>[1]): void =>
    onPatch({ transition: mergeTransition(transition, patch) });

  const toggle = (key: HudTransitionProperty, on: boolean): void =>
    set({ properties: on ? [...properties, key] : properties.filter((p) => p !== key) });

  return (
    <Box className="hud-inspect__group">
      {driven.size === 0 && (
        <EmptyState
          size="sm"
          message="No property on this node changes at runtime yet, so nothing has anything to ease between. Adding one anyway is fine. It will ease the day something drives it."
        />
      )}
      {TRANSITION_PROPERTIES.map((key) => (
        <Box key={key} className="hud-transition-row">
          <Checkbox size="sm" label={key} checked={properties.includes(key)} onChange={(on) => toggle(key, on)} />
          {!driven.has(key) && properties.includes(key) && (
            <Text className="hud-editor__hint">Nothing currently drives {key} on this node, so it will not move.</Text>
          )}
        </Box>
      ))}
      {properties.length > 0 && (
        <Box className="hud-inspect__group">
          <Text className="hud-editor__hint">
            One duration and one curve, shared by every property above, because the document model carries a
            single pair per node.
          </Text>
          <ValueField
            label="duration (ms)"
            value={transition?.duration ?? 200}
            onChange={(duration) => set({ duration })}
            scope={scope}
            insideRepeat={insideRepeat}
            min={0}
            step={MS_STEP}
          />
          <EasingPicker label="easing" unsetHint="ease-out, the renderer's own default" value={transition?.easing} onChange={(easing) => set({ easing })} />
        </Box>
      )}
    </Box>
  );
};

export { TransitionsSection };
export type { TransitionsSectionProps };

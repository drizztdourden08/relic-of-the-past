/* @layer renderer-components @kind component */
/**
 * Motion's THIRD block: what happens when the node itself arrives or leaves,
 * such as a `repeat` gaining or losing a child, which "a bound value changed" cannot
 * describe for something that did not exist a frame ago (§27, `hud-motion.ts`).
 *
 * IT RENDERS REGARDLESS OF WHAT IS BOUND, and that is the whole point of
 * lifting it out of the old Transitions section. That section returned a
 * single sentence when nothing on the node was data-bound, taking enter/exit
 * with it. So "a node whose only motion need is an enter fade cannot express
 * it unless something else on it happens to be bound. That is an unrelated
 * condition gating an unrelated control." A node with nothing bound at all can
 * still be a repeat's child.
 *
 * THE NOT-IN-A-REPEAT CASE IS ANNOTATED, NOT DISABLED. An author frequently
 * builds the child first and wraps it in the `repeat` afterwards; a control
 * that refuses the setting until the wrapping exists forces the reverse order
 * for no reason. The note says plainly that nothing will fire yet.
 *
 * THE THREE UNGAPPED CHECKBOX-AND-WORD PAIRS BECOME ONE `ToggleGroup` PER ROW.
 * `properties` is a multi-select (a fade AND a scale is an ordinary enter), so
 * a `SegmentedControl` is single-select by construction and so the wrong control
 * despite what the wireframe's three-segment strip suggests.
 */
import { Box } from '@ds/primitives/Box';
import { Field } from '@ds/primitives/Field';
import { Text } from '@ds/primitives/Text';
import { ToggleGroup } from '@ds/primitives/ToggleGroup';
import { mergeTransition } from '../behavior/transition-edits';
import { EasingPicker } from './EasingPicker';
import { ValueField } from './ValueField';
import type { HudEnterExitProperty, HudEnterExitTransition, HudNode } from '@shared/types/hud';
import { MS_STEP } from '../HudLayoutEditor.constants';

/** What "the node itself arriving" can read as. `position` is the small settle
 *  `useEnterExit`'s own pre-enter transform draws, not a free offset. */
const OPTIONS: readonly { value: HudEnterExitProperty; label: string }[] = [
  { value: 'opacity', label: 'fade' }, { value: 'scale', label: 'scale' }, { value: 'position', label: 'slide' },
];

const DEFAULT_MS = 200;

interface EnterExitEditorProps {
  node: HudNode;
  onPatch: (patch: Partial<HudNode>) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
}

const EnterExitEditor = (props: EnterExitEditorProps) => {
  const { node, onPatch, scope, insideRepeat } = props;
  const transition = node.transition;

  const set = (which: 'enter' | 'exit', value: HudEnterExitTransition | undefined): void =>
    onPatch({ transition: mergeTransition(transition, { [which]: value }) });

  const setProperties = (which: 'enter' | 'exit', properties: HudEnterExitProperty[]): void => {
    const current = transition?.[which];
    // The validator refuses an empty `properties` on an enter/exit (there is
    // nothing for it to move), so clearing the last one clears the whole
    // object instead of saving one that cannot load.
    set(which, properties.length === 0
      ? undefined
      : { properties, duration: current?.duration ?? DEFAULT_MS, ...(current?.easing !== undefined ? { easing: current.easing } : {}) });
  };

  const row = (which: 'enter' | 'exit', label: string) => {
    const value = transition?.[which];
    return (
      <Box key={which} className="hud-inspect__group">
        <Field size="sm" label={label}>
          <ToggleGroup
            value={[...(value?.properties ?? [])]}
            options={[...OPTIONS]}
            onChange={(next) => setProperties(which, next as HudEnterExitProperty[])}
          />
        </Field>
        {value && (
          <>
            <ValueField
              label={`${label} duration (ms)`}
              value={value.duration}
              onChange={(duration) => set(which, { ...value, duration })}
              scope={scope}
              insideRepeat={insideRepeat}
              min={0}
              step={MS_STEP}
            />
            <EasingPicker
              label={`${label} easing`}
              unsetHint="ease-out, the renderer's own default"
              value={value.easing}
              onChange={(easing) => set(which, easing === undefined
                ? { properties: value.properties, duration: value.duration }
                : { ...value, easing })}
            />
          </>
        )}
      </Box>
    );
  };

  return (
    <Box className="hud-inspect__group">
      {row('enter', 'enter')}
      {row('exit', 'exit')}
      {insideRepeat !== true && (
        <Text className="hud-editor__hint">
          This node is not inside a repeat, so nothing adds or removes it. Enter and exit will not
          fire until it is.
        </Text>
      )}
    </Box>
  );
};

export { EnterExitEditor };
export type { EnterExitEditorProps };

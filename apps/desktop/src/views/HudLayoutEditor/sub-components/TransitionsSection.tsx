/* @layer renderer-components @kind component */
import { Box, Checkbox, EmptyState, Text } from '@drizztdourden08/tessera/primitives';
import { drivenProperties, mergeTransition, TRANSITION_PROPERTIES } from '@app/hud-layout-editing/transition-edits';
import { EasingPicker } from './EasingPicker';
import { ValueField } from './ValueField';
import type { HudTransitionProperty } from '@rotp/hud';
import { MS_STEP } from '../HudLayoutEditor.constants';
import type { TransitionsSectionProps } from './TransitionsSection.type';

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
export type { TransitionsSectionProps } from './TransitionsSection.type';

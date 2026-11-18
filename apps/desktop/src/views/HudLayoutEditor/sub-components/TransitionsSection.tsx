/* @layer renderer-components @kind component */
import { Box, Checkbox, EmptyState, Text } from '@drizztdourden08/tessera/primitives';
import { drivenProperties, mergeTransition, TRANSITION_PROPERTIES } from '@app/hud-layout-editing/transition-edits';
import { EasingPicker } from './EasingPicker';
import { ValueField } from './ValueField';
import type { HudTransitionProperty } from '@rotp/hud';
import { MS_STEP } from '../HudLayoutEditor.constants';
import type { TransitionsSectionProps } from './TransitionsSection.type';
import { useT } from '@drizztdourden08/brock-react';

const TransitionsSection = (props: TransitionsSectionProps) => {
  const t = useT();
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
          message={t('hud-editor:transitions-section.message.nothing-on-this-node-changes')}
        />
      )}
      {TRANSITION_PROPERTIES.map((key) => (
        <Box key={key} className="hud-transition-row">
          <Checkbox size="sm" label={key} checked={properties.includes(key)} onChange={(on) => toggle(key, on)} />
          {!driven.has(key) && properties.includes(key) && (
            <Text className="hud-editor__hint">{t('hud-editor:transitions-section.undriven', { key })}</Text>
          )}
        </Box>
      ))}
      {properties.length > 0 && (
        <Box className="hud-inspect__group">
          <Text className="hud-editor__hint">{t('hud-editor:transitions-section.text.one-duration-and-one-curve')}</Text>
          <ValueField
            label={t('hud-editor:transitions-section.label.duration-ms')}
            value={transition?.duration ?? 200}
            onChange={(duration) => set({ duration })}
            scope={scope}
            insideRepeat={insideRepeat}
            min={0}
            step={MS_STEP}
          />
          <EasingPicker label={t('hud-editor:transitions-section.label.easing')} unsetHint={t('hud-editor:transitions-section.unsetHint.ease-out-the-renderer-s')} value={transition?.easing} onChange={(easing) => set({ easing })} />
        </Box>
      )}
    </Box>
  );
};

export { TransitionsSection };

/* @layer renderer-components @kind component */
import { Box, Field, Text, ToggleGroup } from '@drizztdourden08/tessera/primitives';
import { mergeTransition } from '../behavior/transition-edits';
import { EasingPicker } from './EasingPicker';
import { ValueField } from './ValueField';
import type { HudEnterExitProperty, HudEnterExitTransition } from '@rotp/hud';
import { MS_STEP } from '../HudLayoutEditor.constants';
import { DEFAULT_MS, OPTIONS } from './EnterExitEditor.constants';
import type { EnterExitEditorProps } from './EnterExitEditor.type';

const EnterExitEditor = (props: EnterExitEditorProps) => {
  const { node, onPatch, scope, insideRepeat } = props;
  const transition = node.transition;

  const set = (which: 'enter' | 'exit', value: HudEnterExitTransition | undefined): void =>
    onPatch({ transition: mergeTransition(transition, { [which]: value }) });

  const setProperties = (which: 'enter' | 'exit', properties: HudEnterExitProperty[]): void => {
    const current = transition?.[which];
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
export type { EnterExitEditorProps } from './EnterExitEditor.type';

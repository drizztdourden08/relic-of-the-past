/* @layer renderer-components @kind component */
import { Box, Field, Text, ToggleGroup } from '@drizztdourden08/tessera/primitives';
import { mergeTransition } from '@app/hud-layout-editing/transition-edits';
import { EasingPicker } from './EasingPicker';
import { ValueField } from './ValueField';
import type { HudEnterExitProperty, HudEnterExitTransition } from '@rotp/hud';
import { MS_STEP } from '../HudLayoutEditor.constants';
import { DEFAULT_MS, OPTIONS } from './EnterExitEditor.constants';
import type { EnterExitEditorProps } from './EnterExitEditor.type';
import { useT, useText } from '@drizztdourden08/brock-react';

const EnterExitEditor = (props: EnterExitEditorProps) => {
  const t = useT();
  const text = useText();
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
            options={OPTIONS.map((o) => ({ ...o, label: text(o.label) }))}
            onChange={(next) => setProperties(which, next)}
          />
        </Field>
        {value && (
          <>
            <ValueField
              label={t('hud-editor:enter-exit.duration', { label })}
              value={value.duration}
              onChange={(duration) => set(which, { ...value, duration })}
              scope={scope}
              insideRepeat={insideRepeat}
              min={0}
              step={MS_STEP}
            />
            <EasingPicker
              label={t('hud-editor:enter-exit.easing', { label })}
              unsetHint={t('hud-editor:enter-exit-editor.unsetHint.ease-out-the-renderer-s')}
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
      {row('enter', t('hud-editor:enter-exit.enter'))}
      {row('exit', t('hud-editor:enter-exit.exit'))}
      {insideRepeat !== true && (
        <Text className="hud-editor__hint">
          {t('hud-editor:enter-exit-editor.text.this-node-is-not-inside')}
        </Text>
      )}
    </Box>
  );
};

export { EnterExitEditor };

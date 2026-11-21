/* @layer renderer-components @kind component */
import { Pressable } from '@drizztdourden08/tessera/primitives';
import type { ValueChipsProps } from './ValueChips.type';
import { useT } from '@drizztdourden08/brock-react';

const ValueChips = (props: ValueChipsProps) => {
  const t = useT();
  const { field } = props;

  return (
    <>
      {field.focused && !field.formula && (
        <Pressable
          className="hud-value-input__chip"
          title={t('hud-editor:value-chips.title.drive-this-from-the-game')}
          aria-label={t('hud-editor:value-chips.aria.write-a-formula')}
          onMouseDown={(event) => event.preventDefault()}
          onClick={field.startFormula}
        >=</Pressable>
      )}

      {field.formula && (
        <Pressable
          className="hud-value-input__fx"
          aria-label={t('hud-editor:value-chips.aria.insert-a-name-or-a')}
          onMouseDown={(event) => event.preventDefault()}
          onClick={field.openMenu}
        >ƒ ▾</Pressable>
      )}
    </>
  );
};

export { ValueChips };

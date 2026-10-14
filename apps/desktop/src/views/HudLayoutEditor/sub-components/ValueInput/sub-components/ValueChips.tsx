/* @layer renderer-components @kind component */
import { Pressable } from '@drizztdourden08/tessera/primitives';
import type { ValueChipsProps } from './ValueChips.type';

const ValueChips = (props: ValueChipsProps) => {
  const { field } = props;

  return (
    <>
      {field.focused && !field.formula && (
        <Pressable
          className="hud-value-input__chip"
          title="Drive this from the game, or type ="
          aria-label="Write a formula"
          onMouseDown={(event) => event.preventDefault()}
          onClick={field.startFormula}
        >=</Pressable>
      )}

      {field.formula && (
        <Pressable
          className="hud-value-input__fx"
          aria-label="Insert a name or a formula"
          onMouseDown={(event) => event.preventDefault()}
          onClick={field.openMenu}
        >ƒ ▾</Pressable>
      )}
    </>
  );
};

export { ValueChips };

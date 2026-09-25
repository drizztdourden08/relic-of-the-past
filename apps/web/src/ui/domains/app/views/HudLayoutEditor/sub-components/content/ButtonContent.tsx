/* @layer renderer-components @kind component */
/** `button` is a thin pass-through to `ButtonStatesEditor`. */
import { ButtonStatesEditor } from '../ButtonStatesEditor';
import type { GlyphPack, HudButtonSpec } from '@shared/types/hud';

interface ButtonContentProps {
  spec: HudButtonSpec;
  onChange: (patch: Partial<HudButtonSpec>) => void;
  glyphPacks: readonly GlyphPack[];
}

const ButtonContent = (props: ButtonContentProps) => {
  const { spec, onChange, glyphPacks } = props;
  return <ButtonStatesEditor spec={spec} onChange={onChange} glyphPacks={glyphPacks} />;
};

export { ButtonContent };
export type { ButtonContentProps };

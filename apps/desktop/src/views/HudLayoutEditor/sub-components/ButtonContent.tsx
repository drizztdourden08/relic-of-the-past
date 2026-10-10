/* @layer renderer-components @kind component */
import { ButtonStatesEditor } from './ButtonStatesEditor';
import type { ButtonContentProps } from './ButtonContent.type';

const ButtonContent = (props: ButtonContentProps) => {
  const { spec, onChange, glyphPacks } = props;
  return <ButtonStatesEditor spec={spec} onChange={onChange} glyphPacks={glyphPacks} />;
};

export { ButtonContent };
export type { ButtonContentProps } from './ButtonContent.type';

/* @layer renderer-components @kind component */
import { forwardRef } from 'react';
import './TextInput.css';
import { type TextInputProps } from './TextInput.type';

const TextInput = forwardRef<HTMLInputElement, TextInputProps>((props, ref) => {
  const { className = '', size = 'md', htmlSize, ...rest } = props;

  // `md` adds nothing: the base class IS the md rendering, so an existing call
  // site emits the same class attribute it emitted before this prop existed.
  const sm = size === 'sm' ? ' text-input--sm' : '';

  return <input ref={ref} className={`text-input${sm} ${className}`} size={htmlSize} {...rest} />;
});

TextInput.displayName = 'TextInput';

export {
  TextInput,
};

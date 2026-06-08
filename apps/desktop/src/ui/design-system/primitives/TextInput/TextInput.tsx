/* @layer renderer-components @kind component */
import { forwardRef } from 'react';
import './TextInput.css';
import { type TextInputProps } from './TextInput.type';

const TextInput = forwardRef<HTMLInputElement, TextInputProps>((props, ref) => {
  const { className = '', ...rest } = props;

  return <input ref={ref} className={`text-input ${className}`} {...rest} />;
});

TextInput.displayName = 'TextInput';

export {
  TextInput,
};

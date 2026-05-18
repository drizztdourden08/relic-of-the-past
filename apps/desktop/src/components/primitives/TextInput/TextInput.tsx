import type { InputHTMLAttributes } from 'react';
import './TextInput.css';
import { type TextInputProps } from './types';


const TextInput = (props: TextInputProps) => {
  const { className = '', ...rest } = props;

  return <input className={`text-input ${className}`} {...rest} />;
};

export {
  TextInput,
};

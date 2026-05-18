import type { InputHTMLAttributes } from 'react';
import './TextInput.css';

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const TextInput = (props: TextInputProps) => {
  const { className = '', ...rest } = props;

  return <input className={`text-input ${className}`} {...rest} />;
};

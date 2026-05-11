import type { InputHTMLAttributes } from 'react';
import './TextInput.css';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function TextInput({ className = '', ...props }: TextInputProps): JSX.Element {
  return <input className={`text-input ${className}`} {...props} />;
}

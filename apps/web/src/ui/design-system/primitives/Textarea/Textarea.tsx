/* @layer renderer-components @kind component */
import { forwardRef } from 'react';
import './Textarea.css';
import { type TextareaProps } from './Textarea.type';

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
  const { className = '', ...rest } = props;

  return <textarea ref={ref} className={`textarea ${className}`} {...rest} />;
});

Textarea.displayName = 'Textarea';

export {
  Textarea,
};

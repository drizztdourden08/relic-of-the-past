/* @layer renderer-components @kind component */
import './Field.css';
import type { FieldProps } from './Field.type';

const Field = (props: FieldProps) => {
  const { label, hint, error, htmlFor, required, inline, size = 'md', className = '', style, children } = props;
  const cls = [
    'field', size === 'sm' && 'field--sm', inline && 'field--inline', error != null && 'field--invalid', className,
  ].filter(Boolean).join(' ');
  return (
    <div className={cls} style={style}>
      {label != null && (
        <label className="field__label" htmlFor={htmlFor}>
          {label}
          {required && <span className="field__required">*</span>}
        </label>
      )}
      <div className="field__control">{children}</div>
      {error != null ? (
        <span className="field__error">{error}</span>
      ) : hint != null ? (
        <span className="field__hint">{hint}</span>
      ) : null}
    </div>
  );
};

export { Field };

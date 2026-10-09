/* @layer renderer-components @kind component */
import './HudLayoutEditor.content.css';
import { Button, Field, Image, Text } from '@drizztdourden08/tessera/primitives';
import { CARET } from './ReferenceField.constants';
import type { ReferenceFieldProps } from './ReferenceField.type';

const ReferenceField = (props: ReferenceFieldProps) => {
  const {
    label, hint, src, placeholder = '?', specimen, name, kind, action = 'pick',
    compact = false, onOpen, anchorRef, children, className = '', 'aria-label': ariaLabel,
  } = props;

  return (
    <Field size="sm" label={label} hint={hint} className={`hud-ref ${className}`}>
      <Button
        ref={anchorRef}
        variant="ghost"
        size={compact ? 'xs' : 'sm'}
        className={`hud-ref-field${compact ? ' hud-ref-field--compact' : ''}`}
        aria-label={ariaLabel ?? `${label ?? 'Reference'}: ${name}`}
        onClick={onOpen}
      >
        {specimen === undefined
          ? <Image frame src={src} alt="" fallback={placeholder} className="hud-ref-field__thumb" />
          : <Text className="hud-ref-field__specimen">{specimen}</Text>}
        <Text className="hud-ref-field__name">{name}</Text>
        {kind !== undefined && <Text className="hud-ref-field__kind">{kind}</Text>}
        <Text className="hud-ref-field__caret">{CARET[action]}</Text>
      </Button>
      {children}
    </Field>
  );
};

export { ReferenceField };
export type { ReferenceFieldProps } from './ReferenceField.type';

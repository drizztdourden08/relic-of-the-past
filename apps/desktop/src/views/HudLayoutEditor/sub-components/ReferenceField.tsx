/* @layer renderer-components @kind component */
import { Button, Field, Icon, Text } from '@drizztdourden08/tessera/primitives';
import { ReferenceThumb } from './ReferenceThumb';
import { CARET, CARET_ICON_SIZE } from './ReferenceField.constants';
import type { ReferenceFieldProps } from './ReferenceField.type';

const ReferenceField = (props: ReferenceFieldProps) => {
  const {
    label, hint, src, placeholder, specimen, name, kind, action = 'pick',
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
        <ReferenceThumb src={src} placeholder={placeholder} specimen={specimen} />
        <Text className="hud-ref-field__name">{name}</Text>
        {kind !== undefined && <Text className="hud-ref-field__kind">{kind}</Text>}
        <Text className="hud-ref-field__caret" aria-hidden><Icon name={CARET[action]} size={CARET_ICON_SIZE} aria-hidden /></Text>
      </Button>
      {children}
    </Field>
  );
};

export { ReferenceField };
export type { ReferenceFieldProps } from './ReferenceField.type';

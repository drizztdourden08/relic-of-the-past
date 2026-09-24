/* @layer renderer-components @kind component */
/**
 * A floating pill of two or more places to jump between, one lit. It holds no
 * state: the host says which is current and what a pick does.
 */
import { Box } from '../../primitives/Box';
import { Button } from '../../primitives/Button';
import type { FloatingSwitchProps } from './FloatingSwitch.type';
import './FloatingSwitch.css';

const FloatingSwitch = (props: FloatingSwitchProps) => {
  const { items, activeId, onSelect, label, className = '' } = props;
  return (
    <Box as="nav" className={`floating-switch${className ? ` ${className}` : ''}`} aria-label={label}>
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <Button
            key={item.id}
            variant="bare"
            className={`floating-switch__item${active ? ' floating-switch__item--active' : ''}`}
            onClick={() => { if (!active) onSelect(item.id); }}
            disabled={item.disabled}
            aria-current={active ? 'page' : undefined}
          >
            <Box as="span" className="floating-switch__icon" aria-hidden="true">{item.icon}</Box>
            {item.label}
          </Button>
        );
      })}
    </Box>
  );
};

export { FloatingSwitch };

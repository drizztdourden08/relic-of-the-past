/* @layer renderer-components @kind component */
/**
 * A switch shown as a state, not a control: a dot, the name, and the state
 * word at the right end. On is filled and green, off is hollow and quiet, so a
 * grid of them reads at a glance. It fills its cell, so pills in a grid line up.
 */
import type { FlagPillProps } from './FlagPill.type';
import './FlagPill.css';

const FlagPill = (props: FlagPillProps) => {
  const { label, on, onText = 'on', offText = 'off', className = '' } = props;

  return (
    <div className={`flag-pill${className ? ` ${className}` : ''}`} data-on={on ? '' : undefined}>
      <span className="flag-pill__dot" aria-hidden="true" />
      <span className="flag-pill__label" title={label}>{label}</span>
      <span className="flag-pill__state">{on ? onText : offText}</span>
    </div>
  );
};

export { FlagPill };

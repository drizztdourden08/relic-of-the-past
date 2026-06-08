/* @layer renderer-components @kind component */
import './Divider.css';
import type { DividerProps } from './Divider.type';

const Divider = (props: DividerProps) => {
  const { orientation = 'horizontal', className = '' } = props;
  return <div className={`divider divider--${orientation}${className ? ` ${className}` : ''}`} role="separator" />;
};

export { Divider };

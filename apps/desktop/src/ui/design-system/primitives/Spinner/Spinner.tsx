/* @layer renderer-components @kind component */
import './Spinner.css';
import type { SpinnerProps } from './types';

const Spinner = (props: SpinnerProps) => {
  const { size = 'md', className = '' } = props;
  return <div className={`spinner${className ? ` ${className}` : ''}`} data-size={size} role="status" aria-label="Loading" />;
};

export { Spinner };

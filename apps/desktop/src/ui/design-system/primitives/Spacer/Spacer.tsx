/* @layer renderer-components @kind component */
import './Spacer.css';
import type { SpacerProps } from './types';

/** Fixed gap (when `size` given) or a flexible filler (default) inside a flex container. */
const Spacer = (props: SpacerProps) => {
  const { size } = props;
  return <div className="spacer" data-size={size} aria-hidden="true" />;
};

export { Spacer };

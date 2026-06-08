/* @layer renderer-components @kind component */
import type { NativeSelectProps } from '../Select.type';

const NativeSelect = (props: NativeSelectProps) => {
  const { className = '', children, ...rest } = props;

  return (
    <select className={`select ${className}`} {...rest}>
      {children}
    </select>
  );
};

export { NativeSelect };

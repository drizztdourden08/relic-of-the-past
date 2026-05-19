import type { NativeSelectProps } from '../types';

const NativeSelect = (props: NativeSelectProps) => {
  const { className = '', children, ...rest } = props;

  return (
    <select className={`select ${className}`} {...rest}>
      {children}
    </select>
  );
};

export { NativeSelect };

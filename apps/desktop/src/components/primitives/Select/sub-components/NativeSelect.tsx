import type { NativeSelectProps } from '../types';

export const NativeSelect = (props: NativeSelectProps) => {
  const { className = '', children, ...rest } = props;

  return (
    <select className={`select ${className}`} {...rest}>
      {children}
    </select>
  );
};

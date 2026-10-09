/* @layer renderer-components @kind types */
interface MsuPackToolbarProps {
  name: string;
  busy: boolean;
  nameInstalled: boolean;
  onNameChange: (name: string) => void;
  onCreate: () => void;
}

export type { MsuPackToolbarProps };

/* @layer store-site @kind types */
import type { PackState } from '../behavior/usePack.type';

type PackFieldProps = {
  pack: PackState;
  error?: string;
  onLeave: () => void;
};

export type { PackFieldProps };

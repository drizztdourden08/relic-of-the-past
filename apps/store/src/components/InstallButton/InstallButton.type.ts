/* @layer store-site @kind types */
import type { Container } from '@shared/store/types';

type InstallButtonProps = {
  itemId: string;
  container: Container | null;
  size?: 'sm' | 'md';
};

export type { InstallButtonProps };

/* @layer store-site @kind types */
import type { Container } from '@rotp/hub-contracts';

type InstallButtonProps = {
  itemId: string;
  container: Container | null;
  size?: 'sm' | 'md';
};

export type { InstallButtonProps };

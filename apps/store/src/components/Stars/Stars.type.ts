/* @layer store-site @kind types */
import type { Stars as StarCount } from '@rotp/hub-contracts';

type StarsProps = {
  value: number | null;
  size?: 'sm' | 'lg';
  onChange?: (stars: StarCount) => void;
  disabled?: boolean;
  className?: string;
};

export type { StarsProps };

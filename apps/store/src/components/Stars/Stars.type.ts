/* @layer store-site @kind types */
import type { Stars as StarCount } from '@shared/store/rating-types';

type StarsProps = {
  value: number | null;
  size?: 'sm' | 'lg';
  onChange?: (stars: StarCount) => void;
  disabled?: boolean;
  className?: string;
};

export type { StarsProps };

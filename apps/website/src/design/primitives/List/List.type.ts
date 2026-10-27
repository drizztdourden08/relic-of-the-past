/* @layer website-site @kind types */
import type { HTMLAttributes, LiHTMLAttributes, ReactNode } from 'react';

type ListProps = HTMLAttributes<HTMLElement> & {
  ordered?: boolean;
  children?: ReactNode;
};

type ListItemProps = LiHTMLAttributes<HTMLLIElement> & {
  bare?: boolean;
  children?: ReactNode;
};

export type { ListItemProps, ListProps };

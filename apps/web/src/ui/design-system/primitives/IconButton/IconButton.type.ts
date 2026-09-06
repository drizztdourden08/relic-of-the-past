/* @layer renderer-components @kind types */
﻿import type { ButtonHTMLAttributes, ReactNode } from 'react';

type IconButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: 'sm' | 'md';
  /** Toggled-on state, rendered with a clear gold active treatment. */
  active?: boolean;
  label: string;
  children: ReactNode;
}

export type {
  IconButtonVariant,
  IconButtonProps,
};

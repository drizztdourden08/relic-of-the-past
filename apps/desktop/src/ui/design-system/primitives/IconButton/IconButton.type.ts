/* @layer renderer-components @kind types */
﻿import type { ButtonHTMLAttributes, ReactNode } from 'react';

type IconButtonVariant = 'ghost' | 'danger';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: 'sm' | 'md';
  label: string;
  children: ReactNode;
}

export type {
  IconButtonVariant,
  IconButtonProps,
};

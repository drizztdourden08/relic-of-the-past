/* @layer site-kit @kind types */
import type { ReactNode } from 'react';

type DetailField = {
  label: string;
  value: ReactNode;
};

type DetailPaneProps = {
  title: ReactNode;
  fields: readonly DetailField[];
  actions?: ReactNode;
  notice?: ReactNode;
  onClose?: () => void;
  media?: ReactNode;
  className?: string;
  children?: ReactNode;
};

export type { DetailField, DetailPaneProps };

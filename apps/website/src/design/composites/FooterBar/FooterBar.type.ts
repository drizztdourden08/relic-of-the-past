/* @layer website-site @kind types */
import type { ReactNode } from 'react';

type FooterLink = {
  id: string;
  label: string;
  href: string;
  external?: boolean;
};

type FooterBarProps = {
  note?: ReactNode;
  links?: readonly FooterLink[];
  label: string;
};

export type { FooterBarProps, FooterLink };

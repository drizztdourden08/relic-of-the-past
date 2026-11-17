/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface CreateListPaneProps {
  label: string;
  creating: boolean;
  onCreate: () => void;
  available?: boolean;
  notice?: ReactNode;
  children?: ReactNode;
}

export type { CreateListPaneProps };

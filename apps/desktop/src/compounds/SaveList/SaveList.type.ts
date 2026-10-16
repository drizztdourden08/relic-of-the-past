/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface SaveListProps {
  label: string;
  ids: readonly string[];
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  onRename?: (id: string) => void;
  onUndo?: () => void;
  children: ReactNode;
}

type SaveListMove = (index: number, last: number) => number;

interface RowKeyInput extends Pick<SaveListProps, 'ids' | 'onDelete' | 'onRename'> {
  key: string;
  id: string;
  moveTo: (id: string | undefined) => void;
}

export type { RowKeyInput, SaveListMove, SaveListProps };

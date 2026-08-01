/* @layer renderer-app @kind types */
import type { ReactNode } from 'react';

interface ColumnContext {
  /** Resolves any record id to its display name — falls back to the id itself. */
  resolveLabel: (id?: string) => string;
  /** Jumps the inspector to the record this id belongs to. */
  onNavigate: (id: string) => void;
}

interface Column {
  key: string;
  header: string;
  /** A CSS grid track size — a fixed rem width for compact fields, '1fr' for the name column. */
  width: string;
  render: (raw: Record<string, unknown>, ctx: ColumnContext) => ReactNode;
}

export type { Column, ColumnContext };

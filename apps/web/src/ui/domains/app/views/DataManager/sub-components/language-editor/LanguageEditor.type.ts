/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

type LanguageEditorProps = {
  id: string | null;
  readOnly?: boolean;
  origin?: ReactNode;
};

export type { LanguageEditorProps };

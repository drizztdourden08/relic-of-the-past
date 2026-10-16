/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

type LanguageEditorProps = {
  id: string | null;
  list: ReactNode;
  readOnly?: boolean;
  origin?: ReactNode;
};

export type { LanguageEditorProps };

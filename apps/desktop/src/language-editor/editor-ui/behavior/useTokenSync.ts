/* @layer renderer-components @kind hook */
import { useEffect, useRef } from 'react';
import { linesOfTokens, linesToDoc } from '../editor-contract';
import { signatureOf } from '../tokens-signature';
import type { UseTokenSyncParams } from './token-sync.type';

const useTokenSync = (params: UseTokenSyncParams): void => {
  const { editor, tokens, emittedRef, metrics, glossary, onLines } = params;
  const signature = signatureOf(tokens);

  const latest = useRef({ tokens, metrics, glossary, onLines });
  latest.current = { tokens, metrics, glossary, onLines };

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (signature === emittedRef.current) return;
    emittedRef.current = signature;

    const current = latest.current;
    const lines = linesOfTokens(current.tokens, current.metrics, current.glossary);
    editor.commands.setContent(linesToDoc(lines), { emitUpdate: false });
    current.onLines(lines);
  }, [editor, signature]);
};

export { useTokenSync };

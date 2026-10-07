/* @layer renderer-components @kind hook */
/**
 * Runs one pack reader against a source and holds the result. A new source starts over, and a
 * read that finishes after its source was replaced is dropped.
 */
import { useEffect, useState } from 'react';
import type { PackSource } from '../../../pack-source.type';

type PackRead<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

const usePackRead = <T,>(source: PackSource, read: (source: PackSource) => Promise<T>): PackRead<T> => {
  const [state, setState] = useState<PackRead<T>>({ data: null, error: null, loading: true });

  useEffect(() => {
    let live = true;
    setState({ data: null, error: null, loading: true });
    read(source).then(
      (data) => { if (live) setState({ data, error: null, loading: false }); },
      (cause: unknown) => {
        if (!live) return;
        const error = cause instanceof Error ? cause.message : 'The pack could not be read.';
        setState({ data: null, error, loading: false });
      },
    );
    return () => { live = false; };
  }, [source, read]);

  return state;
};

export { usePackRead };
export type { PackRead };

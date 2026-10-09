/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import type { PackSource } from '../../../packs/pack-source.type';
import type { PackRead } from '../PackContents.type';

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

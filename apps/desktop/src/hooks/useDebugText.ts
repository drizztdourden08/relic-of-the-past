/* @layer renderer-lib @kind hook */
import { useEffect, useState } from 'react';

const useDebugText = (build: () => Promise<string>): { debugText: string | null } => {
  const [debugText, setDebugText] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void build().then((text) => {
      if (active) setDebugText(text);
    });
    return () => { active = false; };
  }, [build]);

  return { debugText };
};

export { useDebugText };

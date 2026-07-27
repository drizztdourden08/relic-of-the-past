/* @layer renderer-components @kind hook */
/**
 * Collects the debug-info text once when the page opens rather than on click. The
 * probes are asynchronous (the frame-rate one has to watch real frames), and doing
 * that work inside the click handler would put an await between the user's gesture
 * and the clipboard write.
 */
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

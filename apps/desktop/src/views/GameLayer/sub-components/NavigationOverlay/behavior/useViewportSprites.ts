/* @layer renderer-components @kind hook */
import { useRef, useEffect } from 'react';
import { wasmGetViewportInfo, wasmGetLiveSprites } from '../../../../../game';

const useViewportSprites = () => {
  const spriteRef = useRef<ReturnType<typeof wasmGetLiveSprites>>([]);
  const vpRef = useRef<ReturnType<typeof wasmGetViewportInfo>>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      vpRef.current = wasmGetViewportInfo();
      spriteRef.current = wasmGetLiveSprites();
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  return { vpRef, spriteRef };
};

export { useViewportSprites };

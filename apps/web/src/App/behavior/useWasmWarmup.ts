/* @layer renderer-appshell @kind hook */
/**
 * useWasmWarmup — kicks the background game-core warmup once the React shell has
 * mounted, piping its progress into the boot-progress store (which the
 * BootProgressBar observes). warmWasmCore is single-flight, so React StrictMode's
 * double-invoke in dev is harmless.
 */
import { useEffect } from 'react';
import { warmWasmCore } from '../../lib/game/wasm-warmup';
import { useBootProgressStore } from '../../stores/boot-progress-store';
import type { BootPhase } from '../../stores/boot-progress-store';

const useWasmWarmup = (): void => {
  const update = useBootProgressStore((s) => s.update);

  useEffect(() => {
    void warmWasmCore((patch) => update({
      ...(patch.phase !== undefined ? { phase: patch.phase as BootPhase } : {}),
      ...(patch.message !== undefined ? { message: patch.message } : {}),
      ...(patch.ratio !== undefined ? { ratio: patch.ratio } : {}),
    }));
  }, [update]);
};

export { useWasmWarmup };

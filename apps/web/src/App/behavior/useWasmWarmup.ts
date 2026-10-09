/* @layer renderer-appshell @kind hook */
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
